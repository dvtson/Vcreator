import { AdminEditorNavigation, useAdminEditorState } from '../../components/common/AdminEditorNavigation';
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Save, X, ExternalLink, Building, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { saveFeaturedIndividual, deleteFeaturedIndividual } from '../../services/storageService';
import { FeaturedIndividual, ContentStatus } from '../../types';
import { ImageUploader } from '../../components/common/ImageUploader';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ToastContainer, ToastMessage } from '../../components/common/Toast';

export const AdminIndividualsPage: React.FC = () => {
  const { allFeaturedIndividuals } = useData();

  const [editingInd, setEditingInd, editorReturn] = useAdminEditorState<FeaturedIndividual>();
  const [isSaving, setIsSaving] = useState(false);
  const saving = React.useRef(false);
  const [isNew, setIsNew] = useState(false);
  const [deletingInd, setDeletingInd] = useState<FeaturedIndividual | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, type, text }]);
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleStartNew = () => {
    setIsNew(true);
    setEditingInd({
      id: 'ind_' + Date.now(),
      fullName: '',
      branch: 'VRB Sở Giao Dịch',
      roleTitle: 'Chuyên viên QHKH Bán lẻ',
      achievementSummary: '',
      quote: '',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      order: allFeaturedIndividuals.length + 1,
      externalLink: '',
      status: 'published',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving.current) return;
    if (!editingInd || !editingInd.fullName.trim()) {
      addToast('error', 'Vui lòng nhập họ và tên.');
      return;
    }

    saving.current = true;
    setIsSaving(true);
    try {
      await saveFeaturedIndividual(editingInd);
      addToast('success', isNew ? 'Đã thêm cá nhân vinh danh!' : 'Đã cập nhật thông tin cá nhân!');
      setEditingInd(null);
      setIsNew(false);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi lưu cá nhân.');
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingInd) return;
    try {
      await deleteFeaturedIndividual(deletingInd.id);
      addToast('success', `Đã gỡ vinh danh "${deletingInd.fullName}".`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi xóa cá nhân.');
    } finally {
      setDeletingInd(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <AdminEditorNavigation editing={!!editingInd} isNew={isNew} busy={isSaving} returnTo={editorReturn} onClose={() => setEditingInd(null)} />
      <div hidden={!!editingInd} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Top 5 Cá nhân Nổi bật
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lựa chọn vinh danh những gương mặt sáng tạo truyền cảm hứng (không nhất thiết theo bảng điểm tự động).
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vrb-blue hover:bg-vrb-blue-dark text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm gương mặt vinh danh</span>
        </button>
      </div>

      {/* Inline Form */}
      </div>
      {editingInd && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-vrb-blue shadow-xl space-y-4 animate-fade-in"
        >

          <fieldset disabled={isSaving} className="min-w-0 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-vrb-blue flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{isNew ? 'Thêm Cá Nhân Mới' : `Chỉnh sửa: ${editingInd.fullName}`}</span>
            </h3>
            <button
              type="button"
              onClick={() => setEditingInd(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" /><span className="sr-only">Hủy chỉnh sửa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={editingInd.fullName}
                  onChange={(e) => setEditingInd({ ...editingInd, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Mai Anh"
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đơn vị / Chi nhánh *</label>
                <input
                  type="text"
                  required
                  value={editingInd.branch}
                  onChange={(e) => setEditingInd({ ...editingInd, branch: e.target.value })}
                  placeholder="VRB Sở Giao Dịch Hà Nội"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chức danh / Vị trí</label>
                <input
                  type="text"
                  value={editingInd.roleTitle}
                  onChange={(e) => setEditingInd({ ...editingInd, roleTitle: e.target.value })}
                  placeholder="Chuyên viên QHKH Bán lẻ"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue text-vrb-red font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự hiển thị (1 - 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingInd.order}
                    onChange={(e) => setEditingInd({ ...editingInd, order: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={editingInd.status}
                    onChange={(e) => setEditingInd({ ...editingInd, status: e.target.value as ContentStatus })}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
                  >
                    <option value="published">Đã công bố</option>
                    <option value="draft">Bản nháp</option>
                    <option value="hidden">Đã ẩn</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <ImageUploader
                label="Ảnh đại diện (Avatar chân dung)"
                value={editingInd.avatarUrl}
                onChange={(url) => setEditingInd({ ...editingInd, avatarUrl: url })}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link mạng xã hội / Facebook cá nhân</label>
                <input
                  type="url"
                  value={editingInd.externalLink || ''}
                  onChange={(e) => setEditingInd({ ...editingInd, externalLink: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Thành tích / Điểm nổi bật</label>
            <textarea
              rows={2}
              value={editingInd.achievementSummary}
              onChange={(e) => setEditingInd({ ...editingInd, achievementSummary: e.target.value })}
              placeholder="Đạt hơn 50.000 lượt tương tác tự nhiên với chuỗi video tư vấn tiết kiệm..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trích dẫn truyền cảm hứng (Quote)</label>
            <input
              type="text"
              value={editingInd.quote}
              onChange={(e) => setEditingInd({ ...editingInd, quote: e.target.value })}
              placeholder="Sáng tạo nội dung không khó khi ta đặt trọn tâm huyết..."
              className="w-full text-xs italic border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingInd(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-vrb-blue hover:bg-vrb-blue-dark text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu cá nhân</span>
            </button>
          </div>
          </fieldset>
        </form>
      )}

      <div hidden={!!editingInd}>
      {/* Individuals List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allFeaturedIndividuals.map((ind) => (
          <div
            key={ind.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between relative"
          >
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                #{ind.order}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  ind.status === 'published'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {ind.status === 'published' ? 'Công bố' : 'Nháp'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={ind.avatarUrl}
                  alt={ind.fullName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-vrb-blue/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                <div className="pr-12">
                  <h4 className="font-bold text-slate-900 text-sm">{ind.fullName}</h4>
                  <p className="text-xs text-vrb-red font-semibold">{ind.roleTitle}</p>
                  <p className="text-[11px] text-slate-500">{ind.branch}</p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 line-clamp-3">
                {ind.achievementSummary}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5 mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsNew(false);
                  setEditingInd(ind);
                }}
                className="p-1.5 rounded-lg text-slate-600 hover:text-vrb-blue hover:bg-slate-100 transition-colors"
                title="Sửa thông tin"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeletingInd(ind)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Xóa cá nhân"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      </div>

      <ConfirmModal
        isOpen={!!deletingInd}
        title="Xác nhận gỡ vinh danh cá nhân"
        message="Bạn có chắc chắn muốn gỡ cá nhân này khỏi danh sách Top vinh danh?"
        itemName={deletingInd?.fullName}
        confirmLabel="Gỡ vinh danh"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingInd(null)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
