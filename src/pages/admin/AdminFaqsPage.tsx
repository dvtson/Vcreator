import { AdminEditorNavigation, useAdminEditorState } from '../../components/common/AdminEditorNavigation';
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, HelpCircle, Save, X, Eye, EyeOff } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { saveFaq, deleteFaq } from '../../services/storageService';
import { FaqItem, ContentStatus } from '../../types';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ToastContainer, ToastMessage } from '../../components/common/Toast';

export const AdminFaqsPage: React.FC = () => {
  const { allFaqs } = useData();

  const [search, setSearch] = useState('');
  const [editingFaq, setEditingFaq, editorReturn] = useAdminEditorState<FaqItem>();
  const [isSaving, setIsSaving] = useState(false);
  const saving = React.useRef(false);
  const [isNew, setIsNew] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<FaqItem | null>(null);
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
    setEditingFaq({
      id: 'faq_' + Date.now(),
      question: '',
      answer: '',
      category: 'Chung',
      order: allFaqs.length + 1,
      status: 'published',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving.current) return;
    if (!editingFaq || !editingFaq.question.trim() || !editingFaq.answer.trim()) {
      addToast('error', 'Vui lòng điền câu hỏi và câu trả lời.');
      return;
    }

    saving.current = true;
    setIsSaving(true);
    try {
      await saveFaq(editingFaq);
      addToast('success', isNew ? 'Đã tạo câu hỏi FAQ mới!' : 'Đã cập nhật câu hỏi FAQ!');
      setEditingFaq(null);
      setIsNew(false);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi lưu FAQ.');
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingFaq) return;
    try {
      await deleteFaq(deletingFaq.id);
      addToast('success', 'Đã xóa câu hỏi thành công.');
    } catch (err) {
      console.error(err);
      addToast('error', 'Không thể xóa câu hỏi.');
    } finally {
      setDeletingFaq(null);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return allFaqs;
    const q = search.toLowerCase();
    return allFaqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q)
    );
  }, [allFaqs, search]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <AdminEditorNavigation editing={!!editingFaq} isNew={isNew} busy={isSaving} returnTo={editorReturn} onClose={() => setEditingFaq(null)} />
      <div hidden={!!editingFaq} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Câu hỏi Thường gặp (FAQ)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Giải đáp thắc mắc cho Sales về quy chế, cách tính điểm, nộp bài và trao thưởng.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vrb-blue hover:bg-vrb-blue-dark text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm câu hỏi mới</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo nội dung câu hỏi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-vrb-blue focus:bg-white"
          />
        </div>
      </div>

      {/* Editor Modal / Inline Card */}
      </div>
      {editingFaq && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-vrb-blue shadow-lg space-y-4 animate-fade-in"
        >

          <fieldset disabled={isSaving} className="min-w-0 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-vrb-blue flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>{isNew ? 'Thêm Câu Hỏi FAQ Mới' : 'Chỉnh Sửa Câu Hỏi'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setEditingFaq(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" /><span className="sr-only">Hủy chỉnh sửa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu hỏi *</label>
              <input
                type="text"
                required
                value={editingFaq.question}
                onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                placeholder="Ví dụ: Tôi có được nộp bài vào ngày Thứ Bảy không?"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phân loại / Chủ đề</label>
              <input
                type="text"
                value={editingFaq.category}
                onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                placeholder="Gửi bài, Điểm số, Giải thưởng..."
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu trả lời *</label>
            <textarea
              rows={4}
              required
              value={editingFaq.answer}
              onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
              placeholder="Nhập nội dung giải đáp cụ thể, rõ ràng..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự hiển thị</label>
              <input
                type="number"
                min="1"
                value={editingFaq.order}
                onChange={(e) => setEditingFaq({ ...editingFaq, order: parseInt(e.target.value) || 1 })}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
              <select
                value={editingFaq.status}
                onChange={(e) => setEditingFaq({ ...editingFaq, status: e.target.value as ContentStatus })}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
              >
                <option value="published">Đã công bố</option>
                <option value="draft">Bản nháp</option>
                <option value="hidden">Đã ẩn</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingFaq(null)}
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
              <span>Lưu câu hỏi</span>
            </button>
          </div>
          </fieldset>
        </form>
      )}

      <div hidden={!!editingFaq}>
      {/* Faq List */}
      <div className="space-y-3">
        {filtered.map((faq) => (
          <div
            key={faq.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                  #{faq.order}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-vrb-blue">
                  {faq.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    faq.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : faq.status === 'draft'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {faq.status === 'published' ? 'Đã công bố' : faq.status === 'draft' ? 'Bản nháp' : 'Đã ẩn'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{faq.question}</h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{faq.answer}</p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => {
                  setIsNew(false);
                  setEditingFaq(faq);
                }}
                className="p-2 rounded-xl text-slate-600 hover:text-vrb-blue hover:bg-slate-100 transition-colors"
                title="Sửa câu hỏi"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeletingFaq(faq)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Xóa câu hỏi"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400 italic">
            Chưa có câu hỏi nào.
          </div>
        )}
      </div>

      </div>

      <ConfirmModal
        isOpen={!!deletingFaq}
        title="Xác nhận xóa câu hỏi FAQ"
        message="Bạn có chắc chắn muốn xóa câu hỏi này khỏi danh mục FAQ?"
        itemName={deletingFaq?.question}
        confirmLabel="Xóa câu hỏi"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingFaq(null)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
