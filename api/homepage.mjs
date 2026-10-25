import template from '../server/generated/template.mjs';
import { createPublicContent } from '../server/public-content.mjs';
const content=createPublicContent();
export default { async fetch(request) {
  if(request.method!=='GET')return new Response(null,{status:405});
  try{
    const {renderHome}=await import('../server/generated/renderHome.mjs');
    const stores=['program_info','challenges','awards','featured_individuals','featured_contents'];
    const rows=await Promise.all(stores.map(async store=>{
      const response=await content(new Request(new URL('/api/publicContent?store='+store,request.url)));
      if(!response.ok)throw Error('unavailable');
      return (await response.json()).rows;
    }));
    if(!rows[0][0])throw Error('unavailable');
    rows[1].sort((a,b)=>a.date.localeCompare(b.date));for(const list of rows.slice(2))list.sort((a,b)=>a.order-b.order);
    const snapshot={info:rows[0][0],challenges:rows[1],awards:rows[2],individuals:rows[3],contents:rows[4],faqs:[],boards:[]};
    const html=template.replace('<div id="root"></div>','<div id="root">'+renderHome(snapshot)+'</div>');
    const json=JSON.stringify(snapshot).replace(/</g,'\\u003c');
    return new Response(html.replace('</body>','<script id="vrb-public-data" type="application/json">'+json+'</script></body>'),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=0, must-revalidate','Vercel-CDN-Cache-Control':'public, s-maxage=15','X-Content-Type-Options':'nosniff'}});
  }catch{
    return new Response(template,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
  }
} };
