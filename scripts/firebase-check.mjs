import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const root=process.cwd();const output=path.join(root,'artifacts','firebase-check');fs.mkdirSync(output,{recursive:true});
const reports=[];
function harness() {
 const documents=new Map();let admin=true;let failBatch=false;let beforeTransaction=null;const authListeners=new Set();const watchers=new Set();
 const environment={cloudEnabled:true,cloudWritesEnabled:true,db:{database:true}};
 const context=vm.createContext({console,structuredClone,TextEncoder,TextDecoder,crypto,Date,Map,Set,JSON,Promise,queueMicrotask});
 const snapshot=ref=>({ref,id:ref.id,exists:()=>documents.has(ref.path),data:()=>structuredClone(documents.get(ref.path))});
 const reference=(first,...segments)=>{const prefix=first?.path?[first.path]:[];const full=[...prefix,...segments].join('/');return {path:full,id:full.split('/').pop()};};
 function apply(operations){
  if(failBatch){failBatch=false;throw new Error('simulated network failure');}
  const total=operations.reduce((sum,op)=>sum+new TextEncoder().encode(JSON.stringify(op)).byteLength,0);assert.ok(total<10*1024*1024,'Batch vượt 10 MiB');
  for(const op of operations)if(op.type==='set')assert.ok(new TextEncoder().encode(JSON.stringify(op.value)).byteLength<1024*1024,'Document vượt 1 MiB');
  for(const op of operations)if(op.type==='set')documents.set(op.ref.path,structuredClone(op.value));else documents.delete(op.ref.path);
  if(operations.some(op=>op.ref.path==='site/state'))for(const callback of watchers)queueMicrotask(()=>callback(snapshot(reference(null,'site','state'))));
 }
 const firestore={
  doc:reference,collection:reference,
  getDocFromServer:async ref=>snapshot(ref),
  getDocsFromServer:async ref=>({docs:[...documents.keys()].filter(key=>key.startsWith(ref.path+'/')&&key.split('/').length===ref.path.split('/').length+1).sort().map(key=>snapshot(reference(null,key)))}),
  writeBatch:()=>{const operations=[];return {set(ref,value){operations.push({type:'set',ref,value});return this;},delete(ref){operations.push({type:'delete',ref});return this;},async commit(){apply(operations);}};},
  runTransaction:async(_db,callback)=>{if(beforeTransaction){const hook=beforeTransaction;beforeTransaction=null;hook();}const operations=[];const result=await callback({get:async ref=>snapshot(ref),set(ref,value){operations.push({type:'set',ref,value});},delete(ref){operations.push({type:'delete',ref});}});apply(operations);return result;},
  onSnapshot:(ref,next)=>{watchers.add(next);queueMicrotask(()=>next(snapshot(ref)));return()=>watchers.delete(next);},
 };
 const auth={canManageContent:()=>admin,isAuthenticated:()=>admin,requireAdmin:()=>{if(!admin)throw new Error('not admin');},subscribeAuth:listener=>{authListeners.add(listener);return()=>authListeners.delete(listener);}};
 const modules=new Map();
 function synthetic(name,object){const mod=new vm.SyntheticModule(Object.keys(object),function(){for(const [key,value]of Object.entries(object))this.setExport(key,value);},{context,identifier:name});modules.set(name,mod);return mod;}
 synthetic('firebase/firestore',firestore);synthetic('auth-service',auth);const config=synthetic('firebase-config',environment);
 async function load(file){
  if(modules.has(file))return modules.get(file);
  const source=fs.readFileSync(file,'utf8');const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
  const mod=new vm.SourceTextModule(compiled,{context,identifier:file});modules.set(file,mod);
  await mod.link(async(specifier,owner)=>{
   if(specifier==='firebase/firestore')return modules.get(specifier);
   if(specifier.endsWith('/authService')||specifier==='./authService')return modules.get('auth-service');
   if(specifier==='./firebase'||specifier==='./firestoreClient')return config;
   return load(path.resolve(path.dirname(owner.identifier),specifier+'.ts'));
  });return mod;
 }
 return {documents,load,context,setAdmin(value){admin=value;authListeners.forEach(listener=>listener());},setWrites(value){config.setExport('cloudWritesEnabled',value);},failNextBatch(){failBatch=true;},setBeforeTransaction(hook){beforeTransaction=hook;}};
}
const h=harness();const cloudModule=await h.load(path.join(root,'src/services/cloudStore.ts'));await cloudModule.evaluate();const cloud=cloudModule.namespace;
const model=(await h.load(path.join(root,'src/services/cloudModel.ts'))).namespace;
const fixture=model.seedPayload();fixture.data.pageDocuments.find(row=>row.id==='the-le').draftContentHtml='<p>SECRET-DRAFT-CONTENT</p>';fixture.data.pageDocuments.find(row=>row.id==='the-le').draftMetadata={title:'SECRET-DRAFT-TITLE',versionName:'draft',updatedDate:'2026-10-21',pdfAttachmentName:'secret.pdf',pdfAttachmentUrl:''};
const bytes=new TextEncoder();
for(const text of ['A'.repeat(400000),'😀'.repeat(140000),'Đặng Thị Ánh '.repeat(24000)]){
 const record={id:'large',text};const encoded=model.encodeRecord(record);assert.equal(JSON.stringify(model.decodeRecord(encoded.inline,encoded.parts)),JSON.stringify(record));assert.ok(encoded.parts.every(part=>bytes.encode(part).length<1024*1024));
}
reports.push('Chia/ghép dữ liệu lớn và Unicode bảo toàn nội dung, mỗi phần dưới giới hạn tài liệu Firestore.');
h.setWrites(false);await assert.rejects(cloud.replaceCloudDatabase(fixture,true));assert.equal(h.documents.size,0);h.setWrites(true);
h.setAdmin(false);await assert.rejects(cloud.replaceCloudDatabase(fixture,true));assert.equal(h.documents.size,0);h.setAdmin(true);
reports.push('Chưa bật ghi cloud hoặc không có phiên admin thì không tạo bất kỳ dữ liệu cloud nào.');
await cloud.replaceCloudDatabase(fixture,true);let state=h.documents.get('site/state');let gen=state.activeGeneration;
const privateDoc=await cloud.getCloudRecord('page_documents','the-le');assert.ok(privateDoc.draftContentHtml.includes('SECRET'));
h.setAdmin(false);const publicDoc=await cloud.getCloudRecord('page_documents','the-le');assert.equal(publicDoc.draftContentHtml,undefined);assert.equal(publicDoc.draftMetadata,undefined);h.setAdmin(true);
const beforeSize=h.documents.size;await assert.rejects(cloud.replaceCloudDatabase(fixture,true));assert.equal(h.documents.size,beforeSize);
reports.push('Chuyển lần đầu không ghi đè cloud có dữ liệu; bản công khai không chứa nội dung hoặc metadata bản nháp.');
let challenges=await cloud.listCloudRecords('challenges');const first=challenges.find(row=>row.id==='c1');const second=challenges.find(row=>row.id==='c2');
await cloud.mergeCloudRecords('challenges',[{...second,isFeaturedHome:true}]);challenges=await cloud.listCloudRecords('challenges');assert.equal(challenges.find(row=>row.id==='c1').isFeaturedHome,false);assert.equal(challenges.find(row=>row.id==='c2').isFeaturedHome,true);
await assert.rejects(cloud.mergeCloudRecords('challenges',[{...second,slug:first.slug}]));
assert.equal((await cloud.getCloudRecord('challenges','c2')).slug,second.slug);
await cloud.mergeCloudRecords('challenges',[{...second,status:'hidden',isFeaturedHome:true}]);h.setAdmin(false);assert.equal(await cloud.getCloudRecord('challenges','c2'),null);h.setAdmin(true);
reports.push('Ghim thử thách đồng bộ trong một giao dịch; đường dẫn trùng bị chặn; ẩn nội dung gỡ bản công khai.');
const pdf='data:application/pdf;base64,'+'A'.repeat(6_990_508);
await cloud.mergeCloudRecords('page_documents',[{...privateDoc,pdfAttachmentUrl:pdf,pdfAttachmentName:'large.pdf',draftMetadata:{title:privateDoc.title,versionName:'draft',updatedDate:'2026-10-21',pdfAttachmentName:'same-large.pdf',pdfAttachmentUrl:pdf}}]);
assert.equal((await cloud.getCloudRecord('page_documents','the-le')).pdfAttachmentUrl,pdf);
for(const value of h.documents.values())assert.ok(bytes.encode(JSON.stringify(value)).length<1024*1024);
reports.push('PDF khoảng 5 MiB được lưu và đọc lại đầy đủ; không phát sinh tài liệu quá 1 MiB hoặc yêu cầu quá 10 MiB trong mô phỏng.');
const previous=h.documents.get('site/state').activeGeneration;h.failNextBatch();await assert.rejects(cloud.replaceCloudDatabase(fixture));assert.equal(h.documents.get('site/state').activeGeneration,previous);
const currentInfo=await cloud.getCloudRecord('program_info','vrb-creator-2026');
h.setBeforeTransaction(()=>{const key=`datasets/${gen}/privateStores/program_info`;h.documents.set(key,{...h.documents.get(key),version:'concurrent'});});
await assert.rejects(cloud.mergeCloudRecords('program_info',[{...currentInfo,title:'SHOULD NOT BE SAVED'}]));
cloud.invalidateCloudCache();assert.notEqual((await cloud.getCloudRecord('program_info','vrb-creator-2026')).title,'SHOULD NOT BE SAVED');
reports.push('Lỗi mạng khi chuẩn bị dữ liệu và sửa đồng thời không thay phiên bản đang công khai hoặc báo lưu thành công sai.');
let events=0;const stop=cloud.subscribeCloudChanges(()=>events++,error=>{throw error;});await new Promise(resolve=>setTimeout(resolve,0));await cloud.mergeCloudRecords('faqs',[{...fixture.data.faqs[0],question:'Realtime QA'}]);await new Promise(resolve=>setTimeout(resolve,0));stop();assert.ok(events>=2);
const exported=JSON.parse(await cloud.exportCloudDatabase());assert.equal(exported.data.pageDocuments.find(row=>row.id==='the-le').pdfAttachmentUrl,pdf);await cloud.replaceCloudDatabase(exported);assert.notEqual(h.documents.get('site/state').activeGeneration,previous);
reports.push('Thông báo thay đổi realtime, xuất sao lưu và khôi phục đầy đủ dữ liệu hoạt động trong mô phỏng.');
// Check authentication logic against a controlled SDK, never send test passwords to Firebase.
async function checkAuth(initialUser=null){
 const fake={currentUser:initialUser,authStateReady:async()=>{}};const calls=[];let changed=()=>{};
 const normal={uid:'FBeRHAsHrNPeuhmfUF6yeF8QmMs2',email:'sondvt@vrbank.com.vn',metadata:{lastSignInTime:'2026-10-21'}};
 const sdk={browserSessionPersistence:'SESSION',setPersistence:async(_auth,persistence)=>calls.push(persistence),onAuthStateChanged:(_auth,callback)=>{changed=callback;return()=>{};},signInWithEmailAndPassword:async(_auth,email,password)=>{
  if(password!=='fixture-password')throw {code:'auth/invalid-credential'};
  fake.currentUser={...normal,uid:email==='other@example.test'?'other-uid':normal.uid,email};changed(fake.currentUser);return {user:fake.currentUser};
 },signOut:async()=>{fake.currentUser=null;changed(null);}};
 const ctx=vm.createContext({console,Set,Promise});
 const synth=(name,obj)=>new vm.SyntheticModule(Object.keys(obj),function(){Object.entries(obj).forEach(([k,v])=>this.setExport(k,v));},{context:ctx,identifier:name});
 const dep=synth('sdk',sdk),config=synth('config',{auth:fake,adminUid:normal.uid,adminEmail:normal.email});
 const code=ts.transpileModule(fs.readFileSync('src/services/authService.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 let member=null;
 const roleModule=synth('roles',{canManageContentRole:role=>['super_admin','admin'].includes(role)});const membership=synth('membership',{getMemberProfile:async()=>member});
 const module=new vm.SourceTextModule(code,{context:ctx});await module.link(spec=>spec==='firebase/auth'?dep:spec==='./adminRoles'?roleModule:spec==='./adminMembership'?membership:config);await module.evaluate();const auth=module.namespace;await auth.authReady;
 assert.equal(auth.getAuthState().ready,true);assert.equal(calls[0],'SESSION');
 assert.equal((await auth.login('test1','1')).success,false);assert.equal((await auth.login('other@example.test','fixture-password')).success,false);assert.equal(auth.isAuthenticated(),false);
 assert.equal((await auth.login(normal.email,'fixture-password')).success,true);assert.equal(auth.isAuthenticated(),true);assert.equal(auth.getCurrentUser().uid,normal.uid);
 await auth.logout();assert.equal(auth.isAuthenticated(),false);assert.equal(auth.getCurrentUser(),null);
 member={email:'other@example.test',enabled:true,role:'reviewer'};assert.equal((await auth.login('other@example.test','fixture-password')).success,true);assert.equal(auth.getCurrentUser().role,'reviewer');assert.throws(()=>auth.requireAdmin());assert.throws(()=>auth.requireSuperAdmin());auth.requireSubmissionReader();
 member={...member,role:'admin'};assert.equal((await auth.login('other@example.test','fixture-password')).success,true);auth.requireAdmin();assert.throws(()=>auth.requireSuperAdmin());
 member={...member,enabled:false};assert.equal((await auth.login('other@example.test','fixture-password')).success,false);
 await auth.logout();
}
await checkAuth();await checkAuth({uid:'FBeRHAsHrNPeuhmfUF6yeF8QmMs2',email:'sondvt@vrbank.com.vn',metadata:{lastSignInTime:'restored'}});
reports.push('Đăng nhập email/mật khẩu, kiểm tra UID, phục hồi phiên và đăng xuất qua SDK giả lập: tài khoản demo và tài khoản khác đều bị từ chối.');
fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({passed:true,type:'isolated SDK simulation; no live cloud calls; deployed Rules not evaluated',reports},null,2));console.log(reports.join('\n'));

