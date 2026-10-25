import { AdminEditorNavigation, useAdminEditorState } from '../../components/common/AdminEditorNavigation';
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Trophy, Save, X, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { saveAward, deleteAward } from '../../services/storageService';
import { AwardItem, ContentStatus } from '../../types';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ToastContainer, ToastMessage } from '../../components/common/Toast';

export const AdminAwardsPage: React.FC = () => {
  const { allAwards, programInfo } = useData();

  const [editingAward, setEditingAward, editorReturn] = useAdminEditorState<AwardItem>();
  const [isSaving, setIsSaving] = useState(false);
  const saving = React.useRef(false);
  const [isNew, setIsNew] = useState(false);
  const [deletingAward, setDeletingAward] = useState<AwardItem | null>(null);
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
    setEditingAward({
      id: 'aw_' + Date.now(),
      group: 'monday',
      groupName: 'Thử thách Thứ Hai',
      title: '',
      periodDescription: 'Hàng tuần',
      prizeQuantity: '01 giải',
      rewardValue: '1.000.000 VNĐ',
      totalEstimated: 1000000,
      evaluationCriteria: '',
      order: allAwards.length + 1,
      status: 'published',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving.current) return;
    if (!editingAward || !editingAward.title.trim()) {
      addToast('error', 'Vui lòng nhập tên hạng mục giải.');
      return;
    }

    saving.current = true;
    setIsSaving(true);
    try {
      await saveAward(editingAward);
      addToast('success', isNew ? 'Đã thêm hạng mục giải thưởng mới!' : 'Đã cập nhật mức thưởng!');
      setEditingAward(null);
      setIsNew(false);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi lưu giải thưởng.');
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingAward) return;
    try {
      await deleteAward(deletingAward.id);
      addToast('success', 'Đã xóa hạng mục giải thưởng.');
    } catch (err) {
      console.error(err);
      addToast('error', 'Không thể xóa giải thưởng.');
    } finally {
      setDeletingAward(null);
    }
  };

  const totalSum = allAwards.reduce((acc, a) => acc + (a.totalEstimated || 0), 0);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <AdminEditorNavigation editing={!!editingAward} isNew={isNew} busy={isSaving} returnTo={editorReturn} onClose={() => setEditingAward(null)} />
      <div hidden={!!editingAward} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Cơ cấu & Mức thưởng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Điều chỉnh linh hoạt các hạng mục giải tuần, giải nửa tháng và giải tổng kết theo dự thảo.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm hạng mục giải mới</span>
        </button>
      </div>

      {/* Budget Balance Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-vrb-blue-deep rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-1">
            Thống kê ngân sách giải thưởng
          </span>
          <div className="text-2xl font-extrabold">
            Tổng chi tiết: <span className="text-amber-300">{formatVND(totalSum)}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            (Ngân sách khung toàn chương trình theo dự thảo: <strong>{new Intl.NumberFormat('vi-VN').format(programInfo.budgetTotal ?? 102000000)} VNĐ</strong>)
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/20">
            {allAwards.length} hạng mục giải
          </span>
        </div>
      </div>

      {/* Inline Editor Form */}
      </div>
      {editingAward && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-vrb-red shadow-xl space-y-4 animate-fade-in"
        >

          <fieldset disabled={isSaving} className="min-w-0 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-vrb-red flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>{isNew ? 'Thêm Giải Thưởng Mới' : `Chỉnh sửa: ${editingAward.title}`}</span>
            </h3>
            <button
              type="button"
              onClick={() => setEditingAward(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" /><span className="sr-only">Hủy chỉnh sửa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên hạng mục giải thưởng *</label>
              <input
                type="text"
                required
                value={editingAward.title}
                onChange={(e) => setEditingAward({ ...editingAward, title: e.target.value })}
                placeholder="Ví dụ: Giải Nhất Thử Thách Tuần"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhóm giải thưởng</label>
              <select
                value={editingAward.group}
                onChange={(e) => {
                  const grp = e.target.value as AwardItem['group'];
                  const grpName =
                    grp === 'monday'
                      ? 'Thử thách Thứ Hai'
                      : grp === 'biweekly'
                      ? 'Giải Nửa Tháng'
                      : 'Giải Tổng Kết';
                  setEditingAward({ ...editingAward, group: grp, groupName: grpName });
                }}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
              >
                <option value="monday">1. Thử thách Thứ Hai</option>
                <option value="biweekly">2. Giải Nửa Tháng</option>
                <option value="grand">3. Giải Tổng Kết Chung Cuộc</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mức thưởng hiển thị</label>
              <input
                type="text"
                required
                value={editingAward.rewardValue}
                onChange={(e) => setEditingAward({ ...editingAward, rewardValue: e.target.value })}
                placeholder="Ví dụ: 1.000.000 VNĐ / giải"
                className="w-full text-xs font-bold text-vrb-red border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tổng tiền ước tính (VNĐ số)</label>
              <input
                type="number"
                min="0"
                step="50000"
                value={editingAward.totalEstimated}
                onChange={(e) =>
                  setEditingAward({ ...editingAward, totalEstimated: parseInt(e.target.value) || 0 })
                }
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng giải</label>
              <input
                type="text"
                value={editingAward.prizeQuantity}
                onChange={(e) => setEditingAward({ ...editingAward, prizeQuantity: e.target.value })}
                placeholder="01 giải / tuần (Tổng 8 giải)"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kỳ xét thưởng</label>
              <input
                type="text"
                value={editingAward.periodDescription}
                onChange={(e) =>
                  setEditingAward({ ...editingAward, periodDescription: e.target.value })
                }
                placeholder="Hàng tuần (8 tuần liên tiếp)"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự & Trạng thái</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={editingAward.order}
                  onChange={(e) =>
                    setEditingAward({ ...editingAward, order: parseInt(e.target.value) || 1 })
                  }
                  className="w-24 text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
                />
                <select
                  value={editingAward.status}
                  onChange={(e) =>
                    setEditingAward({ ...editingAward, status: e.target.value as ContentStatus })
                  }
                  className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
                >
                  <option value="published">Đã công bố</option>
                  <option value="draft">Bản nháp</option>
                  <option value="hidden">Đã ẩn</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu chí xét giải</label>
            <textarea
              rows={2}
              value={editingAward.evaluationCriteria}
              onChange={(e) =>
                setEditingAward({ ...editingAward, evaluationCriteria: e.target.value })
              }
              placeholder="Bài thi có nội dung xuất sắc nhất, đúng chủ đề..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingAward(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu giải thưởng</span>
            </button>
          </div>
          </fieldset>
        </form>
      )}

      <div hidden={!!editingAward}>
      {/* Awards Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Hạng mục giải</th>
                <th className="py-3.5 px-4">Nhóm giải</th>
                <th className="py-3.5 px-4">Mức thưởng</th>
                <th className="py-3.5 px-4">Tổng dự tính</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allAwards.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                    {item.order}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.title}
                    <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                      {item.periodDescription}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {item.groupName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-vrb-red whitespace-nowrap">
                    {item.rewardValue}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                    {formatVND(item.totalEstimated || 0)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status === 'published' ? 'Công bố' : 'Nháp'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNew(false);
                          setEditingAward(item);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-vrb-blue hover:bg-slate-100 transition-colors"
                        title="Chỉnh sửa giải thưởng"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingAward(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Xóa giải thưởng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      </div>

      <ConfirmModal
        isOpen={!!deletingAward}
        title="Xác nhận xóa hạng mục giải thưởng"
        message="Hạng mục giải thưởng này sẽ bị gỡ bỏ khỏi bảng cơ cấu giải thưởng."
        itemName={deletingAward?.title}
        confirmLabel="Xóa giải thưởng"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingAward(null)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
