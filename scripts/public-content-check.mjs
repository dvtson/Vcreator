import assert from 'node:assert/strict';
import { createPublicContent } from '../server/public-content.mjs';
function encode(value) {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key,item]) => [key,encode(item)])) } };
}
const doc = (name,value) => ({ name, fields: encode(value).mapValue.fields });
let time=100_000,calls=0;
const image='data:image/jpeg;base64,'+Buffer.from([255,216,255,0]).toString('base64');
const value={id:'video-1',title:'Video thật',status:'published',thumbnailUrl:image};
const json=JSON.stringify(value);
const publicPath='/datasets/gen/publicStores/featured_contents/records';
const fetcher=async(url,options)=>{
  calls++;assert.ok(!options.headers?.Authorization);assert.ok(!url.includes('privateStores')&&!url.includes('admin_users')&&!url.includes('/submissions'));
  const path=new URL(url).pathname.split('/documents')[1];
  if(path==='/site/state')return Response.json(doc('site/state',{activeGeneration:'gen',changeId:'one'}));
  if(path===publicPath)return Response.json({documents:[doc(publicPath+'/video-1',{revision:'r1',partCount:1}),doc(publicPath+'/hidden',{revision:'r2',partCount:0,inline:{id:'hidden',status:'draft',title:'Must not appear'}})]});
  if(path===publicPath+'/video-1/parts/r1_0')return Response.json(doc('part',{revision:'r1',index:0,text:json}));
  throw Error('Unexpected path '+path);
};
const handler=createPublicContent({fetcher,now:()=>time});
const request=path=>handler(new Request('https://example.test/api/publicContent'+path));
assert.equal((await request('?store=admin_users')).status,404);assert.equal(calls,0);
const response=await request('?store=featured_contents');assert.equal(response.status,200);assert.ok(response.headers.get('Vercel-CDN-Cache-Control').includes('s-maxage'));
const body=await response.json();assert.equal(body.rows.length,1);assert.ok(body.rows[0].thumbnailUrl.startsWith('/api/publicContent?'));assert.ok(!JSON.stringify(body).includes('base64'));
const firstCalls=calls;await request('?store=featured_contents');assert.equal(calls,firstCalls,'Warm visitor must reuse server cache');
const asset=await handler(new Request('https://example.test'+body.rows[0].thumbnailUrl));assert.equal(asset.headers.get('Content-Type'),'image/jpeg');assert.deepEqual(Buffer.from(await asset.arrayBuffer()),Buffer.from([255,216,255,0]));
assert.equal((await request('?store=featured_contents&id=hidden&field=thumbnailUrl&rev=r2')).status,404);
assert.equal((await request('?store=featured_contents&id=video-1&field=thumbnailUrl&rev=wrong')).status,404);
time+=16_000;await request('?store=featured_contents');assert.ok(calls>firstCalls);
const broken=createPublicContent({fetcher:async()=>new Response('',{status:403})});const failure=await broken(new Request('https://example.test/api/publicContent?store=featured_contents'));assert.equal(failure.status,503);assert.equal(failure.headers.get('Cache-Control'),'no-store');
console.log('Public CDN delivery, image separation, cache expiry and anonymous-only reads passed.');
