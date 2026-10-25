import { useState } from 'react';
import { cloudEnabled, cloudWritesEnabled, firebaseConfig } from '../../services/firebase';
import { exportLocalDatabase, migrateLocalDatabaseToCloud } from '../../services/dataRepository';
import { cloudErrorMessage } from '../../services/serviceErrors';
import { downloadFile } from '../../services/transferService';
import { notifyDataChanged } from '../../services/storageService';
import { ConfirmModal } from './ConfirmModal';
export function CloudMigrationPanel() {
  const [busy,setBusy]=useState(false);const [confirm,setConfirm]=useState(false);const [message,setMessage]=useState('');
  const exportLocal=async()=>{
    setBusy(true);setMessage('');
    try{downloadFile(`vrb-du-lieu-trinh-duyet-${Date.now()}.json`,await exportLocalDatabase(),'application/json');setMessage('Đã xuất dữ liệu từ trình duyệt này.');}
    catch(error){setMessage(cloudErrorMessage(error));}finally{setBusy(false);}
  };
  const migrate=async()=>{
    setBusy(true);setMessage('');setConfirm(false);
    try{
      downloadFile(`vrb-truoc-khi-chuyen-cloud-${Date.now()}.json`,await exportLocalDatabase(),'application/json');
      await migrateLocalDatabaseToCloud();notifyDataChanged();setMessage('Đã chuyển dữ liệu lên cloud. Bản trên trình duyệt vẫn được giữ. Chỉ chuyển website sang đọc cloud sau khi kiểm tra dữ liệu.');
    }catch(error){setMessage(cloudErrorMessage(error));}finally{setBusy(false);}
  };
  return <section className="bg-blue-50 border border-blue-200 p-5 sm:p-6 rounded-2xl space-y-3 text-sm">
    <h2 className="font-bold text-vrb-blue">Kết nối dữ liệu dùng chung</h2>
    <p>Dự án: <strong>{firebaseConfig.projectId || 'Chưa cấu hình'}</strong>. Nguồn dữ liệu website: <strong>{cloudEnabled?'Cloud Firestore':'Trình duyệt hiện tại'}</strong>.</p>
    <p className="text-slate-600 leading-relaxed">Dữ liệu trình duyệt chỉ có trên máy và địa chỉ website đang dùng. Xuất bản sao trước khi chuyển. Chuyển lần đầu chỉ thực hiện khi cloud còn trống, không ghi đè dữ liệu đã tồn tại.</p>
    {!cloudWritesEnabled && <p className="text-amber-800">Chưa kích hoạt ghi cloud. Đang chờ duyệt quyền truy cập và bước chuyển dữ liệu.</p>}
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled={busy} onClick={exportLocal} className="border bg-white rounded-xl px-4 py-2 disabled:opacity-50">Xuất dữ liệu trình duyệt</button>
      <button type="button" disabled={busy||!cloudWritesEnabled||cloudEnabled} onClick={()=>setConfirm(true)} className="bg-vrb-blue text-white rounded-xl px-4 py-2 disabled:opacity-40">{busy?'Đang xử lý…':'Chuyển lần đầu lên cloud'}</button>
    </div>
    {message&&<p role="status" className="leading-relaxed">{message}</p>}
    <ConfirmModal isOpen={confirm} title="Xác nhận chuyển dữ liệu lên cloud" message="Hệ thống sẽ tải bản sao lưu, rồi chuyển toàn bộ dữ liệu từ trình duyệt này lên cloud còn trống. Các nội dung đã công bố sẽ có thể được đọc theo quyền đã cấu hình. Dữ liệu trình duyệt được giữ nguyên." itemName={firebaseConfig.projectId} confirmLabel="Xác nhận chuyển" isDanger={false} onConfirm={migrate} onCancel={()=>setConfirm(false)} />
  </section>;
}
