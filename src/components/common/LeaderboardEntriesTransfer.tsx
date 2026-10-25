import { useState } from 'react';
import { LeaderboardEntry, LeaderboardPeriod } from '../../types';
import { downloadFile, parseCSV, toCSV } from '../../services/transferService';
export function LeaderboardEntriesTransfer({period,onChange}:{period:LeaderboardPeriod;onChange:(rows:LeaderboardEntry[])=>void}) {
 const [message,setMessage]=useState('');const [pending,setPending]=useState<LeaderboardEntry[]|null>(null);
 return <div className="p-4 border rounded-xl bg-slate-50 space-y-3 text-sm">
  <div className="flex flex-wrap gap-3">
   <button type="button" onClick={()=>downloadFile(`bang-diem-${period.periodCode}.csv`,toCSV(period.entries as unknown as Record<string,unknown>[]),'text/csv;charset=utf-8')} className="border bg-white rounded-lg px-3 py-2">Xuất danh sách điểm CSV</button>
   <button type="button" onClick={()=>downloadFile('mau-danh-sach-diem.csv',toCSV([{id:'nhan-su-01',rank:1,name:'Nguyễn Văn A',branch:'Chi nhánh Hà Nội',score:100,awardWon:''}]),'text/csv;charset=utf-8')} className="border bg-white rounded-lg px-3 py-2">Tải mẫu nhập điểm</button>
   <label className="border bg-white rounded-lg px-3 py-2 cursor-pointer">Nhập danh sách điểm CSV<input type="file" accept=".csv" className="sr-only" onChange={async e=>{
    const file=e.target.files?.[0];e.target.value='';if(!file)return;setMessage('');
    try{
     if(file.size>5*1024*1024)throw new Error('Tệp vượt quá 5 MB');
     const rows=parseCSV(await file.text());const ids=new Set();
     for(const row of rows){if(!row.id||ids.has(row.id)||typeof row.name!=='string'||!row.name.trim()||typeof row.rank!=='number'||!Number.isInteger(row.rank)||row.rank<1||typeof row.score!=='number'||!Number.isFinite(row.score)||row.score<0)throw new Error('Kiểm tra mã id, họ tên, thứ hạng (số nguyên dương) và điểm (số không âm).');ids.add(row.id);}
     if(!rows.length)throw new Error('Tệp không có danh sách điểm');setPending(rows as unknown as LeaderboardEntry[]);
    }catch(error){setMessage(error instanceof Error?error.message:'Không đọc được tệp');}
   }}/></label>
   <a href={period.type==='personal'?'/xep-hang/ca-nhan':'/xep-hang/tap-the'} target="_blank" rel="noopener noreferrer" className="text-vrb-blue underline py-2">Xem bảng xếp hạng ↗</a>
  </div>
  <p className="text-xs text-slate-500">Nhập sẽ thay danh sách điểm trong bản đang sửa. Kiểm tra rồi bấm Lưu để công bố. Xuất CSV trước khi nhập nếu cần giữ danh sách hiện tại.</p>
  {message&&<p role="alert">{message}</p>}
  {pending&&<div className="bg-amber-50 border p-3 rounded-lg"><p>Thay danh sách hiện tại bằng {pending.length} dòng? {pending.slice(0,3).map(row=>row.name).join(', ')}</p><button type="button" className="text-vrb-blue underline mr-4" onClick={()=>{onChange(pending);setPending(null);setMessage('Đã đưa điểm vào bản đang sửa. Bấm Lưu để hoàn tất.');}}>Áp dụng danh sách</button><button type="button" onClick={()=>setPending(null)}>Hủy</button></div>}
 </div>;
}
