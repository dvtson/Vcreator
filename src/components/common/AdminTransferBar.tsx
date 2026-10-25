import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { downloadFile, importSection, parseCSV, prepareImport, readSnapshot, Section, toCSV } from '../../services/transferService';
const sections: Record<string,{section:Section;url:string;label:string}> = {
  info:{section:'programInfo',url:'/',label:'Thông tin chương trình'},
  challenges:{section:'challenges',url:'/thu-thach',label:'Thử thách'},
  pages:{section:'pageDocuments',url:'/the-le',label:'Thể lệ và tài liệu'},
  faqs:{section:'faqs',url:'/huong-dan',label:'FAQ'},
  awards:{section:'awards',url:'/giai-thuong',label:'Giải thưởng'},
  'top-individuals':{section:'featuredIndividuals',url:'/',label:'Cá nhân nổi bật'},
  content:{section:'featuredContents',url:'/noi-dung-noi-bat',label:'Bài viết và video'},
  leaderboards:{section:'leaderboards',url:'/xep-hang/ca-nhan',label:'Bảng xếp hạng'},
  'site-text':{section:'programInfo',url:'/',label:'Nội dung giao diện'},
};
export function AdminTransferBar() {
  const location=useLocation();const config=sections[location.pathname.split('/')[2]];
  const [pending,setPending]=useState<{section:Section;rows:unknown[];name:string}|null>(null);
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  if(!config)return null;
  const run=async(action:()=>Promise<void>)=>{setBusy(true);setMessage('');try{await action();}catch(error){setMessage(error instanceof Error?error.message:'Không thể thực hiện thao tác');}finally{setBusy(false);}};
  const exportData=(csv:boolean)=>run(async()=>{
    const snapshot=await readSnapshot();const value=snapshot.data[config.section];const rows=Array.isArray(value)?value:[value];
    downloadFile(`vrb-${config.section}-${new Date().toISOString().slice(0,10)}.${csv?'csv':'json'}`,csv?toCSV(rows as unknown as Record<string,unknown>[]):JSON.stringify(rows,null,2),csv?'text/csv;charset=utf-8':'application/json');
    setMessage('Đã xuất dữ liệu đã lưu.');
  });
  return <section className="admin-transfer mb-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
    <div className="transfer-actions flex flex-wrap gap-2 sm:gap-3 items-center text-sm">
      <strong>{config.label}</strong>
      <Link to={config.url} target="_blank" rel="noopener noreferrer" className="text-vrb-blue underline">Xem trên website ↗</Link>
      <button disabled={busy} onClick={()=>exportData(false)} className="border rounded-lg px-3 py-2">Xuất JSON</button>
      <button disabled={busy} onClick={()=>exportData(true)} className="border rounded-lg px-3 py-2">Xuất CSV (Excel)</button>
      <label className="border rounded-lg px-3 py-2 cursor-pointer">Nhập JSON / CSV<input disabled={busy} type="file" accept=".json,.csv" className="sr-only" onChange={e=>{
        const file=e.target.files?.[0];e.target.value='';if(!file)return;
        void run(async()=>{
          if(file.size>25*1024*1024)throw new Error('Tệp quá 25 MB. Hãy chia nhỏ trước khi nhập.');
          const text=await file.text();const rows=file.name.toLowerCase().endsWith('.csv')?parseCSV(text):JSON.parse(text);
          await prepareImport(config.section,rows);setPending({section:config.section,rows:Array.isArray(rows)?rows:[rows],name:file.name});
        });
      }}/></label>
    </div>
    <p className="text-xs leading-relaxed text-slate-500 max-w-4xl">Xuất danh sách hiện tại làm mẫu. Nhập theo mã id: cập nhật dòng trùng mã, thêm dòng mới, giữ các dòng khác. Cột entries chứa danh sách điểm ở dạng JSON. Nội dung chưa bấm Lưu sẽ chưa được xuất.</p>
    {message && <p role="status" className="text-sm">{message}</p>}
    {pending && <div className="border border-amber-300 bg-amber-50 rounded-lg p-4 space-y-3">
      <p>Sẵn sàng nhập {pending.rows.length} dòng từ {pending.name}. Trước khi nhập, hệ thống tải một bản sao lưu dữ liệu hiện tại.</p>
      <ul className="text-xs list-disc pl-5">{(pending.rows as Record<string,unknown>[]).slice(0,5).map(row=><li key={String(row.id)}>{String(row.id)} — {String(row.title??row.fullName??row.question??row.periodName??'')}</li>)}</ul>
      <button disabled={busy} className="bg-vrb-blue text-white px-3 py-2 rounded-lg mr-3" onClick={()=>run(async()=>{
        const snapshot=await readSnapshot();downloadFile(`vrb-truoc-khi-nhap-${Date.now()}.json`,JSON.stringify(snapshot,null,2),'application/json');
        await importSection(pending.section,pending.rows);setPending(null);setMessage('Đã nhập thành công. Có thể mở website để kiểm tra.');
      })}>Xác nhận nhập</button>
      <button disabled={busy} onClick={()=>setPending(null)}>Hủy</button>
    </div>}
  </section>;
}
