import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';
import {installMockFirebaseAuth,fixturePassword} from './firebase-test-auth.mjs';
const root=process.cwd();const output=path.resolve('artifacts/firebase-browser');const temp=path.join(output,'tmp');fs.mkdirSync(temp,{recursive:true});process.env.TEMP=temp;process.env.TMP=temp;
const require=createRequire(import.meta.url);let playwright;try{playwright=require.resolve('playwright');}catch{playwright=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');}
const {chromium}=await import(pathToFileURL(playwright).href);const {createServer}=await import('vite');
const server=await createServer({cacheDir:path.join(output,'vite-cache'),define:{'import.meta.env.VITE_FIREBASE_CLOUD_ENABLED':'"false"','import.meta.env.VITE_FIREBASE_ALLOW_CLOUD_WRITES':'"false"'},plugins:[{name:'deny-unassigned-accounts',enforce:'pre',transform(code,id){if(id.endsWith('/src/services/adminMembership.ts'))return 'export async function getMemberProfile(){return null;}';if(id.endsWith('/src/services/adminApi.ts'))return "export async function automaticThumbnail(){return {image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZQ0AAAAASUVORK5CYII='};}";}}],server:{host:'127.0.0.1',port:5193,strictPort:true,watch:{ignored:['**/artifacts/**','**/backups/**']}}});await server.listen();
let context;const reports=[];const errors=[];
try{
 context=await chromium.launchPersistentContext(path.join(output,'profile'),{executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,env:{...process.env,TEMP:temp,TMP:temp,LOCALAPPDATA:temp},viewport:{width:1280,height:900},acceptDownloads:true});
 const stats=await installMockFirebaseAuth(context);context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
 const page=await context.newPage();const base='http://127.0.0.1:5193';await page.goto(base);await page.locator('h1').waitFor();
 const popup=context.waitForEvent('page');await page.locator('header a[href="/admin"]').first().click();const admin=await popup;await admin.waitForURL('**/admin/login');await admin.locator('#admin-username').waitFor();
 assert.equal(await admin.locator('#admin-username').getAttribute('type'),'email');assert.equal(await admin.locator('#admin-username').inputValue(),'');assert.equal(await admin.locator('#admin-password').inputValue(),'');assert.ok(!(await admin.locator('body').innerText()).includes('test1'));
 await admin.locator('#admin-username').fill('other@example.test');await admin.locator('#admin-password').fill(fixturePassword);await admin.locator('button[type=submit]').click();await admin.getByText('Tài khoản này không có quyền quản trị.',{exact:true}).waitFor();assert.ok(admin.url().endsWith('/admin/login'));
 reports.push('Tab quản trị riêng; form dùng email; tài khoản ngoài UID admin bị từ chối qua Firebase SDK với phản hồi mạng giả lập.');
 await admin.locator('#admin-username').fill('sondvt@vrbank.com.vn');await admin.locator('#admin-password').fill('wrong-test-password');await admin.locator('button[type=submit]').click();await admin.getByText('Email hoặc mật khẩu không chính xác, hoặc tài khoản chưa được cấp quyền quản trị.',{exact:true}).waitFor();
 await admin.locator('#admin-password').fill(fixturePassword);await admin.locator('button[type=submit]').click();await admin.waitForURL('**/admin');await admin.getByRole('heading',{name:'Xin chào Quản trị viên VRB!'}).waitFor();
 await admin.reload();await admin.getByRole('heading',{name:'Xin chào Quản trị viên VRB!'}).waitFor();reports.push('Email/mật khẩu sai được báo lỗi; tài khoản đúng vào được quản trị và giữ phiên sau khi tải lại, không chuyển nhầm về đăng nhập.');
 const blocked=await page.evaluate(async()=>{const storage=await import('/src/services/storageService.ts');try{await storage.saveProgramInfo(await storage.getProgramInfo());return false;}catch{return true;}});assert.equal(blocked,true);
 await admin.goto(base+'/admin/backup');await admin.getByRole('heading',{name:'Kết nối dữ liệu dùng chung'}).waitFor();assert.equal(await admin.getByRole('button',{name:'Chuyển lần đầu lên cloud',exact:true}).isDisabled(),true);
 const saved=await admin.waitForFunction(()=>document.body.innerText.includes('Trình duyệt hiện tại'));assert.ok(saved);
 const download=admin.waitForEvent('download');await admin.getByRole('button',{name:'Xuất dữ liệu trình duyệt',exact:true}).click();assert.ok((await download).suggestedFilename().endsWith('.json'));
 reports.push('Dữ liệu vẫn ở trình duyệt, nút chuyển cloud bị khóa, xuất bản sao local hoạt động; tab người xem không có quyền lưu.');
 await admin.evaluate(async()=>{const s=await import('/src/services/storageService.ts');await s.saveProgramInfo({...await s.getProgramInfo(),title:'VRB FIREBASE QA'});});await page.getByRole('heading',{name:'VRB FIREBASE QA',exact:false}).waitFor();
 const roundtrip=await admin.evaluate(async()=>{
  const s=await import('/src/services/storageService.ts');const t=await import('/src/services/transferService.ts');const snapshot=JSON.parse(await s.exportDatabaseBackup());
  for(const [section,value]of Object.entries(snapshot.data)){const rows=Array.isArray(value)?value:[value];await t.prepareImport(section,t.parseCSV(t.toCSV(rows)));}
  await t.importSection('faqs',[{id:'firebase-qa-faq',question:'Kiểm tra kết nối',answer:'Giữ dữ liệu local',category:'Chung',order:50,status:'published'}]);return (await s.getFaqs()).some(row=>row.id==='firebase-qa-faq');
 });assert.ok(roundtrip);reports.push('Lưu và đồng bộ giữa tab local, xuất/nhập JSON-CSV từng nhóm tiếp tục hoạt động sau khi thay xác thực.');

 // Exercise the list/editor roundtrip at the bottom of a long list in an isolated profile.
 const editors=[
  {route:'faqs',get:'getFaqs',save:'saveFaq',edit:'Sửa câu hỏi',submit:'Lưu câu hỏi',field:'question'},
  {route:'awards',get:'getAwards',save:'saveAward',edit:'Chỉnh sửa giải thưởng',submit:'Lưu giải thưởng',field:'title'},
  {route:'top-individuals',get:'getFeaturedIndividuals',save:'saveFeaturedIndividual',edit:'Sửa thông tin',submit:'Lưu cá nhân',field:'fullName'},
  {route:'content',get:'getFeaturedContents',save:'saveFeaturedContent',edit:'Sửa video',submit:'Lưu thông tin video',field:'title'},
 ];
 await admin.evaluate(async(configs)=>{
  const s=await import('/src/services/storageService.ts');
  for(const config of configs){const source=(await s[config.get](true))[0];for(let i=0;i<20;i++)await s[config.save]({...source,id:'editor-qa-'+i,order:1+(i%5),originalUrl:'https://example.test/editor/'+i,[config.field]:'QA editor '+i});}
 },editors);
 for(const width of [1280,390]){
  await admin.setViewportSize({width,height:700});
  for(const config of editors){
   console.log('Editor roundtrip',width,config.route);
   await admin.goto(base+'/admin/'+config.route);await admin.locator('main h1').waitFor();
   const edit=admin.getByRole('button',{name:config.edit,exact:true}).last();
   await edit.scrollIntoViewIfNeeded();await edit.focus();
   const position=await admin.locator('main').evaluate(el=>el.scrollTop);assert.ok(position>100);
   await edit.click();await admin.locator('form').waitFor();
   assert.equal(await admin.getByRole('button',{name:config.edit,exact:true}).count(),0);
   assert.equal(await admin.locator('main').evaluate(el=>el.scrollTop),0);
   const field=admin.locator('form input').first();assert.ok(await field.evaluate(el=>el===document.activeElement));
   const title='QA saved '+width+' '+config.route;await field.fill(title);
   await admin.getByRole('button',{name:config.submit,exact:true}).click();await admin.locator('form').waitFor({state:'detached'});
   const restored=await admin.locator('main').evaluate(el=>({top:el.scrollTop,max:el.scrollHeight-el.clientHeight}));
   assert.ok(Math.abs(restored.top-Math.min(position,restored.max))<8,JSON.stringify({width,route:config.route,position,restored}));
   assert.ok(await admin.evaluate(async({get,field,title})=>{const s=await import('/src/services/storageService.ts');return (await s[get](true)).some(row=>row[field]===title);},{...config,title}));
   await edit.click();await admin.locator('form').waitFor();await admin.getByRole('button',{name:'← Quay lại danh sách',exact:true}).click();await admin.locator('form').waitFor({state:'detached'});
  }
 }
 await admin.goto(base+'/admin/faqs');await admin.getByRole('button',{name:'Thêm câu hỏi mới',exact:true}).click();await admin.locator('form').waitFor();
 await admin.locator('form input').first().fill('QA failure must retain editor');await admin.locator('form textarea').fill('Answer');
 await admin.evaluate(()=>{window.__originalTransaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(names,mode,...rest){if(mode==='readwrite')throw new Error('QA save failure');return window.__originalTransaction.call(this,names,mode,...rest);};});
 await admin.getByRole('button',{name:'Lưu câu hỏi',exact:true}).click();await admin.getByText('Lỗi khi lưu FAQ.',{exact:true}).waitFor();
 assert.equal(await admin.locator('form input').first().inputValue(),'QA failure must retain editor');assert.ok(await admin.getByRole('button',{name:'Lưu câu hỏi',exact:true}).isEnabled());
 await admin.evaluate(()=>{IDBDatabase.prototype.transaction=window.__originalTransaction;delete window.__originalTransaction;});
 await admin.getByRole('button',{name:'← Quay lại danh sách',exact:true}).click();
 reports.push('Danh sách dài: 4 mục chuyển màn hình sửa, focus ô đầu tiên, lưu trở về đúng vị trí, giữ dữ liệu và hủy trở lại trên desktop/mobile; lỗi lưu giữ nguyên biểu mẫu để thử lại.');
 for(const route of ['/admin/info','/admin/pages','/admin/faqs','/admin/awards','/admin/top-individuals','/admin/content','/admin/leaderboards','/admin/site-text']){await admin.goto(base+route);await admin.locator('main h1').waitFor();}
 await admin.setViewportSize({width:390,height:844});await admin.screenshot({path:path.join(output,'admin-email-auth.png')});
 await admin.getByRole('button',{name:'Đăng xuất',exact:true}).click();await admin.waitForURL('**/admin/login');
 await admin.evaluate(()=>sessionStorage.setItem('vrb_demo_auth_session',JSON.stringify({username:'test1',loginTime:new Date().toISOString()})));await admin.goto(base+'/admin/info');await admin.waitForURL('**/admin/login');
 assert.deepEqual(errors,[]);assert.equal(stats.cloudRequests,0);assert.deepEqual(stats.unexpected,[]);
 reports.push('Các trang quản trị tải được; đăng xuất chặn truy cập lại; token demo tự tạo không cấp quyền; không có yêu cầu Firestore hay đăng nhập thật ra ngoài.');
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({passed:true,auth:'Firebase browser SDK with intercepted identity endpoints; no live sign-in or cloud writes',reports,stats,errors},null,2));console.log(reports.join('\n'));
}finally{
 if(context)await context.close();await server.close();
 for(const name of ['profile','tmp','LocalLow']){const target=path.resolve(output,name);if(target.startsWith(path.resolve(root,'artifacts')+path.sep)){try{fs.rmSync(target,{recursive:true,force:true});}catch{}}else{console.error('Skipped unsafe test cleanup path');}}
}
