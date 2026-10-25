import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
for(const args of [[],['--ssr','src/server/renderHome.tsx','--outDir','server/generated']]){
  const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build',...args],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);
}
fs.writeFileSync('server/generated/template.mjs','export default '+JSON.stringify(fs.readFileSync('dist/index.html','utf8'))+';\n');
