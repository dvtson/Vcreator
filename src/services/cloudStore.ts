import { db } from './firestoreClient';
export { cloudErrorMessage } from './serviceErrors';
import { collection, doc, getDocFromServer, getDocsFromServer, onSnapshot, runTransaction, writeBatch } from 'firebase/firestore';
import type { DocumentData, DocumentReference, Firestore } from 'firebase/firestore';
import { cloudEnabled, cloudWritesEnabled } from './firebase';
import { canManageContent, requireAdmin, subscribeAuth } from './authService';
import { cleanRecord, decodeRecord, encodeRecord, payloadRecords, publicProjection, sectionStores, storeKeys } from './cloudModel';
import type { ContentRecord, ContentStore } from './cloudModel';
import { validateBackupData, validateStoreItem } from './db';
import type { BackupPayload } from './db';

type SiteState = { activeGeneration: string; changeId: string; updatedAt: string };
type Manifest = { revision: string; partCount: number; inline?: ContentRecord };
type Prepared = { ref: DocumentReference; manifest: Manifest };
const listCache = new Map<string, Promise<ContentRecord[]>>();
const recordCache = new Map<string, Promise<ContentRecord>>();
const recordSizes = new Map<string, number>();
let retainedBytes=0;
let stateCache: Promise<SiteState | null> | null = null;
export function invalidateCloudCache() { stateCache = null; listCache.clear(); }
subscribeAuth(() => { invalidateCloudCache(); recordCache.clear();recordSizes.clear();retainedBytes=0; });
function firestore(): Firestore { if (!db) throw new Error('Chưa cấu hình kết nối Firestore.'); return db; }
function assertWritable() { requireAdmin(); if (!cloudWritesEnabled) throw new Error('Chưa kích hoạt ghi dữ liệu cloud. Cần xác nhận trước khi chuyển dữ liệu hoặc mở quyền lưu.'); }
function stateRef() { return doc(firestore(),'site','state'); }
function recordsRef(gen: string, store: ContentStore, admin: boolean) { return collection(firestore(),'datasets',gen,admin?'privateStores':'publicStores',store,'records'); }
function recordRef(gen: string, store: ContentStore, id: string, admin: boolean) { return doc(recordsRef(gen,store,admin),id); }
function metaRef(gen: string, store: ContentStore) { return doc(firestore(),'datasets',gen,'privateStores',store); }
function parseState(data: DocumentData | undefined): SiteState | null {
  if (!data) return null;
  if (typeof data.activeGeneration !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(data.activeGeneration)) throw new Error('Thông tin dữ liệu cloud không hợp lệ.');
  return data as SiteState;
}
async function readState(): Promise<SiteState | null> {
  if (!stateCache) {
    const request=getDocFromServer(stateRef()).then(snapshot=>parseState(snapshot.data()));
    stateCache=request;
    request.catch(()=>{if(stateCache===request)stateCache=null;});
  }
  return stateCache;
}
function hydrate(ref: DocumentReference, manifest: Manifest): Promise<ContentRecord> {
  const key=`${ref.path}/${manifest.revision}`;
  const cached=recordCache.get(key);if(cached)return cached;
  const request=(async()=>{
    if (!Number.isInteger(manifest.partCount) || manifest.partCount<0 || manifest.partCount>300 || typeof manifest.revision!=='string') throw new Error('Nội dung cloud không đúng định dạng.');
    const parts: string[]=[];
    for(let start=0;start<manifest.partCount;start+=6) {
      const group=await Promise.all(Array.from({length:Math.min(6,manifest.partCount-start)},async(_,offset)=>{
        const index=start+offset;const snapshot=await getDocFromServer(doc(ref,'parts',`${manifest.revision}_${index}`));
        const part=snapshot.data();
        if(!part || part.revision!==manifest.revision || part.index!==index || typeof part.text!=='string')throw new Error('Nội dung cloud thiếu một phần dữ liệu. Vui lòng tải lại.');
        return part.text as string;
      }));parts.push(...group);
    }
    const value=decodeRecord(manifest.inline,parts);
    if(value.id!==ref.id)throw new Error('Mã nội dung cloud không khớp.');
    return value;
  })();
  recordCache.set(key,request);
  request.then(value=>{
    if(recordCache.get(key)!==request)return;
    const size=new TextEncoder().encode(JSON.stringify(value)).byteLength;recordSizes.set(key,size);retainedBytes+=size;
    while(retainedBytes>32*1024*1024 && recordCache.size>1){const oldest=recordCache.keys().next().value!;retainedBytes-=recordSizes.get(oldest)||0;recordSizes.delete(oldest);recordCache.delete(oldest);}
  }).catch(()=>{if(recordCache.get(key)===request){retainedBytes-=recordSizes.get(key)||0;recordSizes.delete(key);recordCache.delete(key);}});
  // Bound retained attachment revisions during a long admin session.
  if(recordCache.size>300){const oldest=recordCache.keys().next().value!;retainedBytes-=recordSizes.get(oldest)||0;recordSizes.delete(oldest);recordCache.delete(oldest);}
  return request;
}
export async function listCloudRecords<T>(store: ContentStore, fresh=false): Promise<T[]> {
  const state=await readState();if(!state)return [];
  const admin=canManageContent();const key=`${state.activeGeneration}/${admin}/${store}`;
  let request=fresh ? undefined : listCache.get(key);
  if(!request){
    request=getDocsFromServer(recordsRef(state.activeGeneration,store,admin)).then(snapshot=>Promise.all(snapshot.docs.map(item=>hydrate(item.ref,item.data() as Manifest))));
    listCache.set(key,request);request.catch(()=>{if(listCache.get(key)===request)listCache.delete(key);});
  }
  return structuredClone(await request) as T[];
}
export async function getCloudRecord<T>(store: ContentStore,id: string): Promise<T|null> {
  return (await listCloudRecords<ContentRecord>(store)).find(item=>item.id===id) as T || null;
}
async function prepare(ref: DocumentReference, value: ContentRecord): Promise<Prepared> {
  const encoded=encodeRecord(value);const revision=crypto.randomUUID();
  for(let start=0;start<encoded.parts.length;start+=2){
    const batch=writeBatch(firestore());
    encoded.parts.slice(start,start+2).forEach((text,offset)=>{
      const index=start+offset;batch.set(doc(ref,'parts',`${revision}_${index}`),{revision,index,text});
    });await batch.commit();
  }
  const manifest: Manifest={revision,partCount:encoded.parts.length};
  if(encoded.inline)manifest.inline=encoded.inline;
  return {ref,manifest};
}
async function prepareCopies(gen: string,store: ContentStore,records: ContentRecord[]) {
  const privateCopies: Prepared[]=[];const publicCopies: Prepared[]=[];const hidden: DocumentReference[]=[];
  for(const value of records){
    privateCopies.push(await prepare(recordRef(gen,store,value.id,true),value));
    const visible=publicProjection(store,value);
    if(visible)publicCopies.push(await prepare(recordRef(gen,store,value.id,false),visible));else hidden.push(recordRef(gen,store,value.id,false));
  }
  return {privateCopies,publicCopies,hidden};
}
function challengeIndex(records: ContentRecord[]) {
  const slugs=Object.create(null) as Record<string,string>;let featuredId='';
  for(const item of records){
    const slug=String(item.slug);
    if(slugs[slug])throw new Error('Đường dẫn thử thách đã tồn tại. Vui lòng chọn đường dẫn khác.');
    slugs[slug]=item.id;
    if(item.isFeaturedHome){if(featuredId)throw new Error('Chỉ được ghim một thử thách.');featuredId=item.id;}
  }
  return {slugs,featuredId};
}
function nextState(gen:string):SiteState{return {activeGeneration:gen,changeId:crypto.randomUUID(),updatedAt:new Date().toISOString()};}
export async function mergeCloudRecords(store:ContentStore,input:unknown[]):Promise<void> {
  assertWritable();
  if(!input.length || input.length>150)throw new Error('Mỗi lần nhập từ 1 đến 150 nội dung. Vui lòng chia nhỏ tệp.');
  const incoming=input.map(cleanRecord);incoming.forEach(row=>validateStoreItem(store,row));
  if(new Set(incoming.map(row=>row.id)).size!==incoming.length)throw new Error('Tệp nhập bị trùng mã nội dung.');
  const state=await readState();if(!state)throw new Error('Cloud chưa có dữ liệu. Cần chuyển dữ liệu ban đầu trước.');
  const gen=state.activeGeneration;
  const meta=await getDocFromServer(metaRef(gen,store));const expectedVersion=meta.data()?.version || '';
  const existing=await listCloudRecords<ContentRecord>(store,true);
  const all=new Map(existing.map(row=>[row.id,row]));incoming.forEach(row=>all.set(row.id,row));
  // A normal single-record pin action automatically unpins its predecessor.
  if(store==='challenges' && incoming.length===1 && incoming[0].isFeaturedHome){
    for(const row of existing)if(row.id!==incoming[0].id && row.isFeaturedHome){const changed={...row,isFeaturedHome:false};all.set(row.id,changed);incoming.push(changed);}
  }
  const index=store==='challenges'?challengeIndex([...all.values()]):{};
  if(store==='program_info' && all.size>1)throw new Error('Chỉ có một cấu hình chương trình. Vui lòng giữ nguyên mã chương trình.');
  const copies=await prepareCopies(gen,store,incoming);
  await runTransaction(firestore(),async tx=>{
    const current=await tx.get(stateRef());const currentMeta=await tx.get(metaRef(gen,store));
    if(current.data()?.activeGeneration!==gen || (currentMeta.data()?.version||'')!==expectedVersion)throw new Error('Dữ liệu vừa được sửa ở nơi khác. Hãy tải lại trước khi lưu.');
    copies.privateCopies.forEach(item=>tx.set(item.ref,item.manifest));copies.publicCopies.forEach(item=>tx.set(item.ref,item.manifest));copies.hidden.forEach(ref=>tx.delete(ref));
    tx.set(metaRef(gen,store),{version:crypto.randomUUID(),...index});tx.set(stateRef(),nextState(gen));
  });
  invalidateCloudCache();
}
export async function deleteCloudRecord(store:ContentStore,id:string):Promise<void> {
  assertWritable();const state=await readState();if(!state)return;
  const gen=state.activeGeneration;
  const meta=await getDocFromServer(metaRef(gen,store));const version=meta.data()?.version||'';
  const existing=await listCloudRecords<ContentRecord>(store,true);
  const index=store==='challenges'?challengeIndex(existing.filter(row=>row.id!==id)):{};
  await runTransaction(firestore(),async tx=>{
    const current=await tx.get(stateRef());const currentMeta=await tx.get(metaRef(gen,store));
    if(current.data()?.activeGeneration!==gen || (currentMeta.data()?.version||'')!==version)throw new Error('Dữ liệu đã thay đổi. Vui lòng tải lại trước khi xóa.');
    tx.delete(recordRef(gen,store,id,true));tx.delete(recordRef(gen,store,id,false));
    tx.set(metaRef(gen,store),{version:crypto.randomUUID(),...index});tx.set(stateRef(),nextState(gen));
  });invalidateCloudCache();
}
export async function exportCloudDatabase():Promise<string> {
  requireAdmin();invalidateCloudCache();
  const before=await readState();
  const lists=await Promise.all(storeKeys.map(store=>listCloudRecords<ContentRecord>(store,true)));
  const after=parseState((await getDocFromServer(stateRef())).data());
  if(before?.activeGeneration!==after?.activeGeneration || before?.changeId!==after?.changeId)throw new Error('Dữ liệu vừa thay đổi khi xuất sao lưu. Vui lòng xuất lại.');
  const lookup=Object.fromEntries(storeKeys.map((store,index)=>[store,lists[index]]));
  const info=lookup.program_info[0];if(!info)throw new Error('Cloud chưa có dữ liệu chương trình để xuất.');
  const data=Object.fromEntries(Object.entries(sectionStores).map(([section,store])=>[section,section==='programInfo'?info:lookup[store]]));
  const payload={version:1,exportedAt:new Date().toISOString(),appName:'VRB CREATOR',data} as unknown as BackupPayload;
  validateBackupData(payload.data);return JSON.stringify(payload,null,2);
}
export async function replaceCloudDatabase(payload:BackupPayload,onlyIfEmpty=false):Promise<void> {
  assertWritable();validateBackupData(payload.data);
  const before=await getDocFromServer(stateRef());const previous=before.data()?.activeGeneration || null;
  if(onlyIfEmpty && previous)throw new Error('Cloud đã có dữ liệu. Chuyển dữ liệu ban đầu sẽ không ghi đè.');
  const grouped=payloadRecords(payload);const gen=crypto.randomUUID();
  // Stage a complete generation. Interrupted uploads cannot become visible to visitors.
  for(const [store,records] of grouped){
    records.forEach(row=>validateStoreItem(store,row));
    const index=store==='challenges'?challengeIndex(records):{};
    for(let start=0;start<records.length;start+=100){
      const copies=await prepareCopies(gen,store,records.slice(start,start+100));const batch=writeBatch(firestore());
      copies.privateCopies.forEach(item=>batch.set(item.ref,item.manifest));copies.publicCopies.forEach(item=>batch.set(item.ref,item.manifest));await batch.commit();
    }
    const batch=writeBatch(firestore());batch.set(metaRef(gen,store),{version:crypto.randomUUID(),...index});await batch.commit();
  }
  await runTransaction(firestore(),async tx=>{
    const current=await tx.get(stateRef());
    if((current.data()?.activeGeneration||null)!==previous || (before.data()?.changeId||null)!==(current.data()?.changeId||null))throw new Error('Cloud đã thay đổi trong lúc nhập. Phiên bản cũ vẫn được giữ; vui lòng thử lại.');
    tx.set(stateRef(),nextState(gen));
  });invalidateCloudCache();
}
export function subscribeCloudChanges(onChange:()=>void,onError:(error:unknown)=>void):()=>void {
  if(!cloudEnabled || !db)return ()=>{};
  let last='';
  return onSnapshot(stateRef(),snapshot=>{
    try {
      const state=parseState(snapshot.data());const signature=JSON.stringify(state);
      if(signature!==last){last=signature;invalidateCloudCache();stateCache=Promise.resolve(state);onChange();}
    } catch(error) { onError(error); }
  },onError);
}
