import { BackupPayload, validateBackupData } from './db';
import { exportCompleteDatabase, mergeStoreRecords, STORES } from './dataRepository';
import { requireAdmin } from './authService';
import { notifyDataChanged } from './storageService';
export type Section = keyof BackupPayload['data'];
export const sectionStores = { programInfo: STORES.PROGRAM_INFO, challenges: STORES.CHALLENGES, pageDocuments: STORES.PAGE_DOCUMENTS, faqs: STORES.FAQS, awards: STORES.AWARDS, featuredIndividuals: STORES.FEATURED_INDIVIDUALS, featuredContents: STORES.FEATURED_CONTENTS, leaderboards: STORES.LEADERBOARDS };
export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href=url; a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
export function toCSV(rows: Record<string, unknown>[]): string {
  const keys = [...new Set(rows.flatMap(row=>Object.keys(row)))];
  const escape = (value: unknown) => '"'+String(value==null?'':typeof value==='object'?JSON.stringify(value):value).replaceAll('"','""')+'"';
  // Prefix formula-like text with an apostrophe so exported content is safe to open in Excel.
  return '\uFEFF'+[keys.map(escape).join(','), ...rows.map(row=>keys.map(key=>{
    const value=row[key]; return escape(typeof value==='string' && /^[=+\-@\t\r]/.test(value) ? "'"+value : value);
  }).join(','))].join('\r\n');
}
export function parseCSV(input: string): Record<string, unknown>[] {
  const text=input.replace(/^\uFEFF/,''); const lines:string[][]=[];let row:string[]=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(c==='"') { if(quoted && text[i+1]==='"'){cell+='"';i++;}else if(quoted || !cell) quoted=!quoted;else throw new Error('Dấu ngoặc kép CSV không hợp lệ'); }
    else if(c===',' && !quoted){row.push(cell);cell='';}
    else if((c==='\n'||c==='\r') && !quoted){if(c==='\r' && text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))lines.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(quoted) throw new Error('CSV chưa đóng dấu ngoặc kép');
  row.push(cell);if(row.some(Boolean))lines.push(row);
  const keys=lines.shift();if(!keys || new Set(keys).size!==keys.length || !keys.includes('id'))throw new Error('CSV cần dòng tiêu đề có cột id và tên cột không trùng nhau');
  const numberFields=new Set(['month','order','totalEstimated','rank','score','budgetTotal']);
  const boolFields=new Set(['isPublished','isFeaturedHome','isSubmissionActive','isZaloActive','isMissingAccountNotice']);
  return lines.map((cells,index)=>{
    if(cells.length!==keys.length)throw new Error(`Dòng ${index+2} sai số cột`);
    return Object.fromEntries(keys.map((key,i)=>{
      let value:unknown=cells[i];
      if(value==='') return [key, undefined];
      if(typeof value==='string' && /^'[=+\-@\t\r]/.test(value))value=value.slice(1);
      if(numberFields.has(key))value=Number(value);
      if(boolFields.has(key)){if(value!=='true' && value!=='false')throw new Error(`Cột ${key} chỉ nhận true/false`);value=value==='true';}
      if(key==='entries' || key==='siteText' || key==='draftMetadata')value=JSON.parse(value as string);
      return [key,value];
    }));
  });
}
export async function readSnapshot() { return JSON.parse(await exportCompleteDatabase()) as BackupPayload; }
export async function prepareImport(section: Section, rows: unknown) {
  const backup=await readSnapshot();
  const normalized=Array.isArray(rows)?rows:[rows];
  if(normalized.length===0)throw new Error('Tệp không có dòng dữ liệu');
  const existing=section==='programInfo'?[backup.data.programInfo]:backup.data[section];
  const ids=new Set();
  const merged=normalized.map(row=>{
    if(!row || typeof row!=='object' || typeof row.id!=='string' || !row.id || ids.has(row.id)) throw new Error('Mỗi dòng cần mã id duy nhất');
    ids.add(row.id);
    const changes=Object.fromEntries(Object.entries(row).filter(([,v])=>v!==undefined));
    return {...existing.find(item=>item.id===row.id),...changes, id: row.id as string};
  });
  const all=new Map(existing.map(item=>[item.id,item]));
  merged.forEach(row=>all.set(row.id,row as typeof existing[number]));
  if(section==='programInfo' && (merged.length!==1 || merged[0].id!==backup.data.programInfo.id))throw new Error('Mã chương trình phải giữ nguyên như tệp đã xuất');
  const next={...backup.data,[section]:section==='programInfo'?merged[0]:[...all.values()]};
  validateBackupData(next as BackupPayload['data']);
  return {rows:merged, data:next[section]};
}
export async function importSection(section: Section, rows: unknown) {
  requireAdmin();
  const prepared=await prepareImport(section,rows);
  await mergeStoreRecords(sectionStores[section],prepared.rows);
  notifyDataChanged(sectionStores[section]);
}
