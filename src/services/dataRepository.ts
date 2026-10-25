import * as local from './db';
import { cloudEnabled } from './firebase';
import { authReady, requireAdmin } from './authService';
const cloud = () => import('./cloudStore');
import { cleanRecord, seedPayload, storeKeys } from './cloudModel';
import type { ContentStore } from './cloudModel';
import type { BackupPayload } from './db';
export { STORES } from './db';
function contentStore(store: string): ContentStore {
  if (!(storeKeys as readonly string[]).includes(store)) throw new Error('Kho dữ liệu không được hỗ trợ.');
  return store as ContentStore;
}
export async function getAllFromStore<T>(store: string): Promise<T[]> {
  await authReady;
  return cloudEnabled ? (await cloud()).listCloudRecords<T>(contentStore(store)) : local.getAllFromStore<T>(contentStore(store));
}
export async function getByIdFromStore<T>(store: string,id: string): Promise<T|null> {
  await authReady;
  return cloudEnabled ? (await cloud()).getCloudRecord<T>(contentStore(store),id) : local.getByIdFromStore<T>(contentStore(store),id);
}
export async function putItemInStore<T>(store:string,item:T):Promise<void> {
  requireAdmin();
  if(cloudEnabled)await (await cloud()).mergeCloudRecords(contentStore(store),[item]);else await local.putItemInStore(contentStore(store),item);
}
export async function deleteItemFromStore(store:string,id:string):Promise<void> {
  requireAdmin();
  if(cloudEnabled)await (await cloud()).deleteCloudRecord(contentStore(store),id);else await local.deleteItemFromStore(contentStore(store),id);
}
export async function putChallengeAtomically(challenge:Parameters<typeof local.putChallengeAtomically>[0]):Promise<void> {
  requireAdmin();
  if(cloudEnabled)await (await cloud()).mergeCloudRecords('challenges',[challenge]);else await local.putChallengeAtomically(challenge);
}
export async function exportCompleteDatabase():Promise<string> {
  requireAdmin();return cloudEnabled ? (await cloud()).exportCloudDatabase() : local.exportCompleteDatabase();
}
export async function exportLocalDatabase():Promise<string> { requireAdmin();return local.exportCompleteDatabase(); }
export async function importCompleteDatabase(json:string):Promise<boolean> {
  requireAdmin();
  if(!cloudEnabled)return local.importCompleteDatabase(json);
  const payload=JSON.parse(json) as BackupPayload;
  if(payload.version!==1)throw new Error('Phiên bản sao lưu không được hỗ trợ.');
  await (await cloud()).replaceCloudDatabase(payload);return true;
}
export async function resetDatabaseToDefaults():Promise<void> {
  requireAdmin();if(cloudEnabled)await (await cloud()).replaceCloudDatabase(seedPayload());else await local.resetDatabaseToDefaults();
}
export async function mergeStoreRecords(store:string,items:unknown[]):Promise<void> {
  requireAdmin();const key=contentStore(store);
  if(cloudEnabled){await (await cloud()).mergeCloudRecords(key,items);return;}
  const rows=items.map(cleanRecord);rows.forEach(row=>local.validateStoreItem(key,row));
  const db=await local.getDB();const tx=db.transaction(key,'readwrite');
  const done=new Promise<void>((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error||new Error('Nhập dữ liệu bị hủy'));tx.onerror=()=>reject(tx.error);});
  for(const row of rows)tx.objectStore(key).put(row);
  await done;
}
export async function migrateLocalDatabaseToCloud():Promise<void> {
  requireAdmin();
  // This function is never called automatically. The operator must enable cloud writes and confirm in the UI.
  const payload=JSON.parse(await local.exportCompleteDatabase()) as BackupPayload;
  await (await cloud()).replaceCloudDatabase(payload,true);
}

