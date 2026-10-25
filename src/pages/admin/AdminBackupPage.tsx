import { CloudMigrationPanel } from '../../components/common/CloudMigrationPanel';
import { cloudEnabled } from '../../services/firebase';
import { downloadFile } from '../../services/transferService';
import { validateBackupData } from '../../services/db';
import React, { useState, useRef } from 'react';
import { Download, Upload, RotateCcw, AlertTriangle, CheckCircle2, Database, Info, HardDrive } from 'lucide-react';
import { exportDatabaseBackup, importDatabaseBackup, resetDatabase } from '../../services/storageService';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ToastContainer, ToastMessage } from '../../components/common/Toast';

export const AdminBackupPage: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingImportJson, setPendingImportJson] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, type, text }]);
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const json = await exportDatabaseBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `VRB_CREATOR_BACKUP_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('success', 'Đã xuất file sao lưu JSON thành công (bao gồm cả ảnh upload)!');
    } catch (err) {
      console.error(err);
      addToast('error', 'Có lỗi khi xuất dữ liệu sao lưu.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) { addToast('error', 'Tệp sao lưu vượt quá 50 MB.'); e.target.value=''; return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try { const parsed=JSON.parse(content); if(parsed.version!==1) throw new Error('Phiên bản sao lưu không hợp lệ'); validateBackupData(parsed.data); setPendingImportJson(content); setShowImportModal(true); } catch(error) { addToast('error', error instanceof Error ? error.message : 'Tệp sao lưu không hợp lệ'); }
    };
    reader.onerror = () => {
      addToast('error', 'Không thể đọc tệp sao lưu.');
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  };

  const confirmImport = async () => {
    if (!pendingImportJson) return;
    setIsImporting(true);
    try {
      downloadFile(`vrb-truoc-khi-khoi-phuc-${Date.now()}.json`,await exportDatabaseBackup(),'application/json');
      await importDatabaseBackup(pendingImportJson);
      addToast('success', 'Đã nhập và khôi phục dữ liệu từ tệp sao lưu thành công!');
    } catch (err: any) {
      console.error(err);
      addToast('error', err.message || 'Lỗi: Tệp JSON sao lưu không đúng định dạng.');
    } finally {
      setIsImporting(false);
      setShowImportModal(false);
      setPendingImportJson(null);
    }
  };

  const confirmReset = async () => {
    try {
      downloadFile(`vrb-truoc-khi-dat-lai-${Date.now()}.json`,await exportDatabaseBackup(),'application/json');
      await resetDatabase();
      addToast('success', 'Đã khôi phục toàn bộ cơ sở dữ liệu về 8 thử thách & dữ liệu demo mẫu!');
    } catch (err) {
      console.error(err);
      addToast('error', 'Không thể khôi phục dữ liệu mặc định.');
    } finally {
      setShowResetModal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sao Lưu & Quản Lý Dữ Liệu
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Xuất file JSON sao lưu, nhập lại dữ liệu và khôi phục trạng thái ban đầu của hệ thống.
        </p>
      </div>

      <CloudMigrationPanel />

      {/* Technical Architecture Notice */}
      <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <HardDrive className="w-4 h-4" />
          <span>{cloudEnabled?'Dữ liệu dùng chung trên cloud':'Dữ liệu trên trình duyệt'}</span>
        </div>
        <h2 className="text-lg font-bold">Lưu ý quan trọng cho Ban Quản trị:</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          {cloudEnabled?'Website đang đọc và lưu dữ liệu trên Firestore. Nội dung đã công bố được đồng bộ đến các thiết bị khác; bản nháp chỉ dành cho quản trị viên.':'Website hiện lưu nội dung trong IndexedDB của trình duyệt này. Chưa tự động chuyển dữ liệu lên cloud.'}
        </p>
        <ul className="text-xs text-slate-300 space-y-1 list-disc pl-5 leading-relaxed">
          <li>Khi tải lại trang (F5) hoặc đóng mở trình duyệt, toàn bộ dữ liệu đã sửa vẫn được bảo toàn nguyên vẹn.</li>
          <li>{cloudEnabled?'Các thao tác nhập toàn bộ hoặc khôi phục sẽ ảnh hưởng dữ liệu cloud dùng chung.':'Dữ liệu chưa đồng bộ giữa các máy tính. Dùng phần chuyển cloud ở trên sau khi được kích hoạt.'}</li>
          <li>Để chuyển dữ liệu sang máy khác hoặc lưu trữ an toàn, hãy sử dụng tính năng <strong>Xuất dữ liệu (.JSON)</strong> bên dưới.</li>
        </ul>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Export */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-vrb-blue flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">1. Xuất Sao Lưu (Export)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tải về toàn bộ cơ sở dữ liệu hiện tại thành 01 file JSON duy nhất (bao gồm cả các ảnh bạn đã tải lên).
            </p>
          </div>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="w-full py-2.5 px-3 rounded-xl bg-vrb-blue hover:bg-vrb-blue-dark text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Đang xuất...' : 'Tải file JSON'}</span>
          </button>
        </div>

        {/* 2. Import */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">2. Nhập Dữ Liệu (Import)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Khôi phục lại hệ thống từ file JSON sao lưu trước đó. Thao tác này sẽ ghi đè dữ liệu hiện có sau khi bạn xác nhận.
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFilePicked}
              className="hidden"
            />
            <button
              type="button"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isImporting ? 'Đang xử lý...' : 'Chọn file JSON'}</span>
            </button>
          </div>
        </div>

        {/* 3. Reset Defaults */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">3. Khôi Phục Dữ Liệu Mẫu</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Xóa sạch các chỉnh sửa thử nghiệm và đặt lại về 8 thử thách chuẩn, 3 video mẫu và cơ cấu giải thưởng ban đầu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Khôi phục mẫu ban đầu</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset Defaults */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Xác nhận khôi phục dữ liệu mẫu ban đầu"
        message="Hành động này sẽ xóa toàn bộ các nội dung bạn đã thêm hoặc sửa đổi trong phiên làm việc này, và đưa hệ thống về đúng 8 thử thách, 3 video và dữ liệu demo chuẩn ban đầu."
        itemName="Toàn bộ nguồn dữ liệu website đang sử dụng"
        confirmLabel="Đồng ý khôi phục"
        cancelLabel="Hủy"
        isDanger={true}
        onConfirm={confirmReset}
        onCancel={() => setShowResetModal(false)}
      />

      {/* Confirmation Modal for JSON Import Overwrite */}
      <ConfirmModal
        isOpen={showImportModal}
        title="Xác nhận nhập tệp sao lưu JSON"
        message="Dữ liệu từ tệp sao lưu sẽ được nạp vào hệ thống và ghi đè lên dữ liệu hiện tại trên trình duyệt này."
        itemName="Ghi đè dữ liệu từ tệp JSON"
        confirmLabel="Xác nhận nạp dữ liệu"
        cancelLabel="Hủy"
        isDanger={false}
        onConfirm={confirmImport}
        onCancel={() => {
          setShowImportModal(false);
          setPendingImportJson(null);
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
