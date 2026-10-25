import { previewImage } from '../server/preview-core.mjs';
import { lookup } from 'node:dns/promises';
const events=[];
try { const result=await previewImage('https://www.tiktok.com/@bthuylinh/video/7621593210179112213',{resolve:lookup,fetcher:async(url,options)=>{const res=await fetch(url,options);events.push({host:new URL(url).hostname,status:res.status,type:res.headers.get('content-type')});return res;}});console.log(JSON.stringify({ok:true,type:result.image.slice(0,30),length:result.image.length,events})); }
catch(error){console.log(JSON.stringify({ok:false,error:error.message,events}));process.exitCode=1;}
