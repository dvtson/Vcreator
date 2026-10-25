import {installMockFirebaseAuth,fixturePassword} from './firebase-test-auth.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const output=path.resolve('artifacts/ui');const temp=path.join(output,'tmp');fs.mkdirSync(temp,{recursive:true});
process.env.TEMP=temp;process.env.TMP=temp;
const require=createRequire(import.meta.url);let playwright;
try{playwright=require.resolve('playwright');}catch{playwright=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');}
const {chromium}=await import(pathToFileURL(playwright).href);
const {createServer}=await import('vite');
const server=await createServer({cacheDir:path.join(output,'vite-cache'),server:{host:'127.0.0.1',port:5192,strictPort:true,watch:{ignored:['**/artifacts/**']}}});await server.listen();
let context;const results=[];const errors=[];
try {
 context=await chromium.launchPersistentContext(path.join(output,'profile'),{executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,env:{...process.env,TEMP:temp,TMP:temp,LOCALAPPDATA:temp},viewport:{width:1440,height:900}});
 await installMockFirebaseAuth(context);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:5192';
 const check=async(route,width)=>{
  await page.setViewportSize({width,height:900});await page.goto(base+route,{waitUntil:'domcontentloaded'});await page.locator('h1,h2').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  const measured=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  if(measured.document>width+1||measured.body>width+1)throw new Error(`Tràn ngang ${route} tại ${width}px: ${JSON.stringify(measured)}`);
  results.push({route,width,...measured});
 };
 for(const width of [360,390,768,1024,1280,1440]){
  await check('/',width);
  if([390,1280,1440].includes(width))await page.screenshot({path:path.join(output,`home-${width}.png`)});
  if(width===390)await page.locator('h4').first().evaluate(e=>e.closest('.group').scrollIntoView({block:'center'}));
  if(width===390)await page.locator('.group').filter({has:page.locator('h4')}).first().screenshot({path:path.join(output,'individual-390.png')});
  const cards=await page.locator('h4').evaluateAll(headings=>headings.map(heading=>{
   const card=heading.closest('.group');const top=card?.firstElementChild?.getBoundingClientRect();const h=heading.getBoundingClientRect();return {bad:!!top && top.bottom>h.top};
  }));if(cards.some(c=>c.bad))throw new Error(`Huy hiệu đè lên tên tại ${width}px`);
 }
 for(const route of ['/thu-thach','/thu-thach/len-song-la-co-co-hoi','/noi-dung-noi-bat','/xep-hang/ca-nhan','/giai-thuong','/cong-dong'])for(const width of [360,1280])await check(route,width);
 await page.goto(base+'/admin/login');await page.locator('#admin-username').fill('sondvt@vrbank.com.vn');await page.locator('#admin-password').fill(fixturePassword);await page.locator('button[type=submit]').click();await page.waitForURL('**/admin');
 for(const route of ['/admin/info','/admin/site-text','/admin/leaderboards','/admin/content'])for(const width of [360,768,1280]){
  await check(route,width);if(width===360)await page.screenshot({path:path.join(output,route.split('/').pop()+'-360.png')});
 }
 await page.goto(base+'/admin/info');
 await page.getByText('Ảnh nền mờ trang chủ (Hero)',{exact:true}).waitFor();
 if(errors.length)throw new Error(errors.join('\n'));
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({passed:true,checks:results,errors},null,2));console.log(`Đã kiểm tra ${results.length} tổ hợp trang/kích thước, không tràn ngang, không đè huy hiệu và không lỗi JavaScript.`);
}finally{if(context)await context.close();await server.close();}


