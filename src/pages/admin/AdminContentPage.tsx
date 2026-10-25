import { AdminEditorNavigation, useAdminEditorState } from '../../components/common/AdminEditorNavigation';
import { automaticThumbnail } from '../../services/adminApi';
import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Video,
  Save,
  X,
  ExternalLink,
  AlertTriangle,
  Play,
  CheckCircle2,
  Link as LinkIcon
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { saveFeaturedContent, deleteFeaturedContent } from '../../services/storageService';
import { FeaturedContent, ContentStatus } from '../../types';
import { ImageUploader } from '../../components/common/ImageUploader';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ToastContainer, ToastMessage } from '../../components/common/Toast';

export const AdminContentPage: React.FC = () => {
  const { allFeaturedContents } = useData();

  const [editingContent, setEditingContent, editorReturn] = useAdminEditorState<FeaturedContent>();
  const [isSaving, setIsSaving] = useState(false);
  const [coverStatus, setCoverStatus] = useState('');
  const currentEditor = React.useRef(editingContent);
  currentEditor.current = editingContent;
  useEffect(() => {
    const url = editingContent?.originalUrl.trim();
    const id = editingContent?.id;
    let cancelled = false;
    if (!url || !/^https:\/\//.test(url)) { setCoverStatus(''); return; }
    const timer = setTimeout(async () => {
      setCoverStatus('Đang lấy ảnh bìa video…');
      const result = await automaticThumbnail(url).catch(() => ({ warning: 'Phiên quản trị đã thay đổi. Hãy đăng nhập lại để lấy ảnh.', image: undefined }));
      if (cancelled) return;
      const latest = currentEditor.current;
      if (!latest || latest.id !== id || latest.originalUrl.trim() !== url) return;
      if (result.image) {
        setEditingContent({ ...latest, thumbnailUrl: result.image });
        setCoverStatus('Đã lấy ảnh bìa từ video. Bấm Lưu để cập nhật bài.');
      } else setCoverStatus(result.warning || 'Chưa lấy được ảnh bìa video.');
    }, 700);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [editingContent?.id, editingContent?.originalUrl]);
  const saving = React.useRef(false);
  const [isNew, setIsNew] = useState(false);
  const [deletingContent, setDeletingContent] = useState<FeaturedContent | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const toastId = crypto.randomUUID();
    setToasts((prev) => [...prev, { id: toastId, type, text }]);
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleStartNew = () => {
    setIsNew(true);
    setEditingContent({
      id: 'content_' + Date.now(),
      title: '',
      authorName: '',
      branch: 'VRB Sở Giao Dịch',
      platform: 'tiktok',
      contentType: 'video',
      originalUrl: '',
      thumbnailUrl: '',
      excerpt: '',
      order: allFeaturedContents.length + 1,
      status: 'published',
      isMissingAccountNotice: false,
      note: '',
      createdAt: new Date().toISOString(),
    });
  };

  // Validate URL protocol and duplicates
  const validateUrl = (url: string, currentId: string): { valid: boolean; error?: string } => {
    if (!url.trim()) return { valid: false, error: 'Vui lòng nhập đường dẫn URL.' };
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { valid: false, error: 'Chỉ chấp nhận giao thức hợp lệ (http:// hoặc https://).' };
      }
    } catch {
      return { valid: false, error: 'Đường dẫn URL không đúng định dạng.' };
    }

    // Check duplicate URL
    const duplicate = allFeaturedContents.find(
      (c) => c.originalUrl.trim() === url.trim() && c.id !== currentId
    );
    if (duplicate) {
      return { valid: false, error: `Đường dẫn này đã tồn tại trong bài thi "${duplicate.title}".` };
    }

    return { valid: true };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving.current) return;
    if (!editingContent || !editingContent.title.trim() || !editingContent.authorName.trim()) {
      addToast('error', 'Vui lòng nhập tiêu đề bài và tên tác giả.');
      return;
    }

    const urlCheck = validateUrl(editingContent.originalUrl, editingContent.id);
    if (!urlCheck.valid) {
      addToast('error', urlCheck.error || 'URL không hợp lệ.');
      return;
    }

    // Auto-detect if TikTok url is missing username (@/)
    let missingNotice = editingContent.isMissingAccountNotice;
    if (editingContent.originalUrl.includes('tiktok.com/@/')) {
      missingNotice = true;
    }

    saving.current = true;
    setIsSaving(true);
    try {
      const preview = await automaticThumbnail(editingContent.originalUrl);
      if (!preview.image && !editingContent.thumbnailUrl) {
        addToast('error', preview.warning || 'Chưa lấy được ảnh bìa video. Chưa lưu; bạn có thể thử lại hoặc chọn ảnh từ video.');
        return;
      }
      await saveFeaturedContent({
        ...editingContent,
        thumbnailUrl: preview.image || editingContent.thumbnailUrl,
        isMissingAccountNotice: missingNotice,
      });
      addToast('success', isNew ? 'Đã thêm video dự thi mới!' : 'Đã cập nhật video thành công!');
      if (preview.warning) addToast('info', preview.warning);
      setEditingContent(null);
      setIsNew(false);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi lưu dữ liệu video.');
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingContent) return;
    try {
      await deleteFeaturedContent(deletingContent.id);
      addToast('success', `Đã xóa bài dự thi "${deletingContent.title}".`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi xóa bài dự thi.');
    } finally {
      setDeletingContent(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <AdminEditorNavigation editing={!!editingContent} isNew={isNew} busy={isSaving} returnTo={editorReturn} onClose={() => setEditingContent(null)} />
      <div hidden={!!editingContent} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Nội dung & Video Nổi bật
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị 3 video mẫu (Facebook Reel & TikTok) và thêm các bài thi xuất sắc khác.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm video bài thi mới</span>
        </button>
      </div>

      {/* Editor Form Modal */}
      </div>
      {editingContent && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-vrb-red shadow-xl space-y-4 animate-fade-in"
        >

          <fieldset disabled={isSaving} className="min-w-0 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-vrb-red flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>{isNew ? 'Thêm Video Bài Dự Thi Mới' : `Chỉnh sửa: ${editingContent.title}`}</span>
            </h3>
            <button
              type="button"
              onClick={() => setEditingContent(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" /><span className="sr-only">Hủy chỉnh sửa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bài thi / Video *</label>
              <input
                type="text"
                required
                value={editingContent.title}
                onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                placeholder="Ví dụ: VRB Mobile Banking - Chuyển tiền siêu tốc..."
                className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nền tảng mạng xã hội</label>
              <select
                value={editingContent.platform}
                onChange={(e) =>
                  setEditingContent({
                    ...editingContent,
                    platform: e.target.value as any,
                  })
                }
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue font-semibold"
              >
                <option value="facebook">Facebook Reel</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube Shorts</option>
                <option value="other">Nền tảng khác</option>
              </select>
            </div>
          </div>

          {/* URL with Test Open Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Đường dẫn URL video gốc *</label>
              {editingContent.originalUrl && (
                <a
                  href={editingContent.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-vrb-blue hover:text-vrb-blue-dark font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Mở thử liên kết trong tab mới
                </a>
              )}
            </div>
            <input
              type="url"
              required
              value={editingContent.originalUrl}
              onChange={(e) => setEditingContent({ ...editingContent, originalUrl: e.target.value, thumbnailUrl: '' })}
              placeholder="https://www.tiktok.com/@bthuylinh/video/..."
              className="w-full text-xs font-mono border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
            />
          </div>

          {/* Missing Account Warning Checkbox */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5">
            <input
              type="checkbox"
              id="isMissingNotice"
              checked={editingContent.isMissingAccountNotice || false}
              onChange={(e) =>
                setEditingContent({
                  ...editingContent,
                  isMissingAccountNotice: e.target.checked,
                })
              }
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            <label htmlFor="isMissingNotice" className="text-xs text-amber-900 cursor-pointer">
              Đánh dấu cảnh báo liên kết thiếu tên tài khoản cụ thể (Dành cho link dạng <code className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">@/</code>)
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên người đăng / Tác giả *</label>
              <input
                type="text"
                required
                value={editingContent.authorName}
                onChange={(e) => setEditingContent({ ...editingContent, authorName: e.target.value })}
                placeholder="Nguyễn Thu Hà"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đơn vị / Chi nhánh</label>
              <input
                type="text"
                value={editingContent.branch}
                onChange={(e) => setEditingContent({ ...editingContent, branch: e.target.value })}
                placeholder="VRB Chi nhánh Hà Nội"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
            <ImageUploader
              label="Ảnh bìa video (tự lấy từ link khi bấm Lưu/Cập nhật)"
              value={editingContent.thumbnailUrl}
              onChange={(url) => setEditingContent({ ...editingContent, thumbnailUrl: url })}
            />
            {coverStatus && <p role="status" className="text-xs text-slate-600 mt-2">{coverStatus}</p>}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự hiển thị & Trạng thái</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={editingContent.order}
                    onChange={(e) =>
                      setEditingContent({ ...editingContent, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-24 text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
                  />
                  <select
                    value={editingContent.status}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        status: e.target.value as ContentStatus,
                      })
                    }
                    className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue font-bold"
                  >
                    <option value="published">Đã công bố</option>
                    <option value="draft">Bản nháp</option>
                    <option value="hidden">Đã ẩn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú quản trị</label>
                <input
                  type="text"
                  value={editingContent.note || ''}
                  onChange={(e) => setEditingContent({ ...editingContent, note: e.target.value })}
                  placeholder="Ghi chú nội bộ..."
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả ngắn nội dung bài thi</label>
            <textarea
              rows={2}
              value={editingContent.excerpt}
              onChange={(e) => setEditingContent({ ...editingContent, excerpt: e.target.value })}
              placeholder="Tóm tắt ngắn gọn nội dung clip..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingContent(null)}
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
              <span>Lưu thông tin video</span>
            </button>
          </div>
          </fieldset>
        </form>
      )}

      <div hidden={!!editingContent}>
      {/* Videos List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Bài thi & Thumbnail</th>
                <th className="py-3.5 px-4">Nền tảng</th>
                <th className="py-3.5 px-4">Tác giả & Đơn vị</th>
                <th className="py-3.5 px-4">Đường dẫn gốc</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allFeaturedContents.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                    {item.order}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3 max-w-sm">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-14 h-9 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs hover:text-vrb-blue">
                          {item.title}
                        </span>
                        {item.isMissingAccountNotice && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 font-medium border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Thiếu tên tài khoản (@/)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                      {item.platform}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <strong className="text-slate-800 block">{item.authorName}</strong>
                    <span className="text-[11px] text-slate-500">{item.branch}</span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-vrb-blue hover:underline truncate block font-mono text-[11px]"
                      title={item.originalUrl}
                    >
                      {item.originalUrl}
                    </a>
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
                      <a
                        href={`/noi-dung-noi-bat/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-vrb-blue hover:bg-slate-100"
                        title="Xem nội dung công bố trên website"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNew(false);
                          setEditingContent({ ...item, thumbnailUrl: item.thumbnailUrl.includes('images.unsplash.com/') ? '' : item.thumbnailUrl });
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-vrb-blue hover:bg-slate-100"
                        title="Sửa video"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingContent(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Xóa video"
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
        isOpen={!!deletingContent}
        title="Xác nhận xóa video bài dự thi"
        message="Hành động này sẽ gỡ video này khỏi thư viện nội dung nổi bật."
        itemName={deletingContent?.title}
        confirmLabel="Xóa video"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingContent(null)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
