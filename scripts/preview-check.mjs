import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { previewDevPlugin } from '../server/preview-dev.mjs';
import { SUPER_UID } from '../server/accounts.mjs';
import { previewImage } from '../server/preview-core.mjs';
let middleware, previews=0;
const plugin=previewDevPlugin({VITE_FIREBASE_API_KEY:'fixture'}, {verify:async token=>{assert.equal(token,'fixture-token');return {sub:SUPER_UID,auth_time:100};},fetcher:async()=>Response.json({users:[{localId:SUPER_UID,validSince:'0'}]}),preview:async()=>{previews++;return {image:'data:image/jpeg;base64,fixture'};}});
plugin.configureServer({middlewares:{use:(_path,fn)=>{middleware=fn;}}});
async function call(headers){const req=Readable.from([Buffer.from(JSON.stringify({data:{url:'https://www.tiktok.com/@test/video/222'}}))]);req.method='POST';req.headers=headers;const res={setHeader(){},end(body){this.body=JSON.parse(body);}};await middleware(req,res);return res;}
assert.equal((await call({})).statusCode,403);assert.equal(previews,0);
assert.equal((await call({origin:'https://evil.test',authorization:'Bearer fixture-token'})).statusCode,403);assert.equal(previews,0);
assert.equal((await call({origin:'http://localhost:5173',authorization:'Bearer fixture-token'})).body.result.image,'data:image/jpeg;base64,fixture');assert.equal(previews,1);
const html='<meta property="og:image" content="https://a.tiktokcdn.com/avatar.jpg"><script id="SIGI_STATE">'+JSON.stringify({ItemModule:{'111':{id:'111',video:{cover:'https://a.tiktokcdn.com/wrong.jpg'}},'222':{id:'222',video:{cover:'https://a.tiktokcdn.com/correct.jpg'}}}})+'</script>';
const urls=[];
const result=await previewImage('https://www.tiktok.com/@test/video/222',{resolve:async()=>[{address:'8.8.8.8'}],fetcher:async url=>{urls.push(String(url));if(String(url).includes('correct.jpg'))return new Response(new Uint8Array([255,216,255,0]));return new Response(html);}});
assert.ok(result.image.startsWith('data:image/jpeg;'));assert.ok(!urls.some(url=>/avatar|wrong/.test(url)));
console.log('Local preview authorization and correct video cover checks passed (mock network; no Firebase writes).');
