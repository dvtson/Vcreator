import React, { useState, useEffect } from 'react';
import { Save, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { saveProgramInfo } from '../../services/storageService';
import { ProgramInfo } from '../../types';
import { ImageUploader } from '../../components/common/ImageUploader';
import { HyperlinkControl } from '../../components/common/HyperlinkControl';
import { ToastContainer, ToastMessage } from '../../components/common/Toast';

export const AdminProgramInfoPage: React.FC = () => {
  const { programInfo } = useData();
  const [formData, setFormData] = useState<ProgramInfo>(programInfo);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setFormData(programInfo);
  }, [programInfo]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = document.querySelector('form');
    if (form && !form.reportValidity()) return;
    setIsSaving(true);
    try {
      await saveProgramInfo(formData);
      addToast('success', 'Đã lưu thông tin chương trình thành công!');
    } catch (err) {
      console.error(err);
      addToast('error', 'Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Thông tin Chương trình & Cấu hình Kênh
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tên chiến dịch, thông điệp slogan, thời gian diễn ra, hotline và các liên kết nộp bài.
          </p>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vrb-blue hover:bg-vrb-blue-dark text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Brand Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            1. Tên Chương Trình & Khẩu Hiệu
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên chương trình</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tiêu đề phụ / Mô tả nhóm</label>
              <input
                type="text"
                value={formData.subTitle}
                onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Khẩu hiệu / Slogan chính thức</label>
            <input
              type="text"
              required
              value={formData.slogan}
              onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue font-bold text-vrb-red"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày bắt đầu</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày kết thúc</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô tả ngắn trang chủ (Hero Description)</label>
            <textarea
              rows={3}
              value={formData.heroDescription}
              onChange={(e) => setFormData({ ...formData, heroDescription: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border space-y-3">
          <label className="block text-sm font-bold">Ngân sách dự thảo toàn chương trình (VNĐ)</label>
          <input aria-label="Ngân sách dự thảo" type="number" min="0" step="1" value={formData.budgetTotal ?? 102000000} onChange={e=>setFormData({...formData,budgetTotal:Number(e.target.value)})} className="border rounded-xl p-3 w-full" />
        </div>
        {/* Media Assets */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            2. Quản lý Hình Ảnh & Logo Thương Hiệu
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ImageUploader
              label="Logo VRB chính thức"
              value={formData.logoUrl}
              onChange={(url) => setFormData({ ...formData, logoUrl: url })}
            />
            <ImageUploader
              label="Ảnh nền mờ trang chủ (Hero)"
              value={formData.bannerUrl}
              onChange={(url) => setFormData({ ...formData, bannerUrl: url })}
            />
          </div>
        </div>

        {/* Channels & Forms Configuration */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            3. Cấu hình Liên kết Biểu Mẫu & Nhóm Zalo
          </h2>

          {/* Submission Form Config */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Form gửi bài trên website</span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isSubmissionActive}
                  onChange={(e) => setFormData({ ...formData, isSubmissionActive: e.target.checked })}
                  className="rounded text-vrb-blue focus:ring-vrb-blue w-4 h-4"
                />
                <span>Kích hoạt nút gửi bài</span>
              </label>
            </div>
            <a href="/gui-bai" target="_blank" rel="noopener noreferrer" className="text-vrb-blue underline text-sm">Mở form gửi bài trên website ↗</a>
            <p className="text-xs text-slate-500">Công tắc này điều khiển hiển thị nút Gửi bài. Mở hoặc tạm dừng tiếp nhận trong mục Bài dự thi đã gửi. Không cần nhập liên kết Google Forms.</p>
          </div>

          {/* Zalo Group Config */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Nhóm Zalo hỗ trợ & thông báo nội bộ</span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isZaloActive}
                  onChange={(e) => setFormData({ ...formData, isZaloActive: e.target.checked })}
                  className="rounded text-vrb-blue focus:ring-vrb-blue w-4 h-4"
                />
                <span>Kích hoạt nút tham gia Zalo</span>
              </label>
            </div>
            <HyperlinkControl
              label="Đường dẫn tham gia Nhóm Zalo"
              url={formData.zaloGroupUrl}
              onUrlChange={(url) => setFormData({ ...formData, zaloGroupUrl: url })}
              placeholderUrl="https://zalo.me/g/..."
            />
          </div>
        </div>

        {/* Support & Hotline */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            4. Đầu mối Liên hệ & Hỗ trợ CBNV
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Số điện thoại Hotline</label>
              <input
                type="text"
                value={formData.hotline}
                onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Hòm thư điện tử (Support Email)</label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Đơn vị phụ trách chính</label>
            <input
              type="text"
              value={formData.supportContact}
              onChange={(e) => setFormData({ ...formData, supportContact: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-vrb-blue hover:bg-vrb-blue-dark text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</span>
          </button>
        </div>
      </form>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
