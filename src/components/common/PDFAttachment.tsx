import { PageDocument } from '../../types';
export function DocumentDownload({doc}:{doc:PageDocument|null}) {
  if(!doc?.pdfAttachmentUrl)return null;
  return <a href={doc.pdfAttachmentUrl} download={doc.pdfAttachmentName||'tai-lieu.pdf'} target="_blank" rel="noopener noreferrer" className="inline-flex border rounded-xl px-4 py-3 text-sm text-vrb-blue my-4">Tải tài liệu PDF: {doc.pdfAttachmentName||'Tài liệu chương trình'}</a>;
}
export function PDFAttachment({name,url,onChange}:{name:string;url:string;onChange:(name:string,url:string)=>void}) {
  return <div className="border rounded-xl p-4 space-y-3 text-sm">
    <label className="block font-semibold">Tệp PDF đính kèm (tối đa 5 MB)
      <input type="file" accept="application/pdf,.pdf" className="block mt-2" onChange={async e=>{
        const file=e.target.files?.[0];e.target.value='';if(!file)return;
        if(!file.name.toLowerCase().endsWith('.pdf') || file.size>5*1024*1024){alert('Vui lòng chọn tệp PDF tối đa 5 MB.');return;}
        const signature=await file.slice(0,5).text();if(signature!=='%PDF-'){alert('Tệp không có định dạng PDF hợp lệ.');return;}
        const reader=new FileReader();reader.onload=()=>onChange(file.name,String(reader.result));reader.onerror=()=>alert('Không đọc được tệp PDF');reader.readAsDataURL(new Blob([file],{type:'application/pdf'}));
      }}/>
    </label>
    <label className="block">Hoặc đường dẫn PDF (https://)<input type="url" value={url.startsWith('data:')?'':url} placeholder="https://…/tai-lieu.pdf" onChange={e=>onChange(name,e.target.value)} className="block border rounded-lg p-2 mt-1 w-full" /></label>
    {url && <div className="flex gap-4"><a href={url} download={name||'tai-lieu.pdf'} target="_blank" rel="noopener noreferrer" className="text-vrb-blue underline">Xem / tải {name||'PDF'}</a><button type="button" onClick={()=>onChange('','')} className="text-red-600">Gỡ tệp</button></div>}
    <p className="text-xs text-slate-500">Bấm Lưu nháp hoặc Công bố để lưu thay đổi tệp cùng nội dung.</p>
  </div>;
}
