import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Flame,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  FileCheck,
  Star,
  Send
} from 'lucide-react';
import { getChallengeById, saveChallenge, deleteChallenge } from '../../services/storageService';
import { Challenge, ContentStatus } from '../../types';
import { ImageUploader } from '../../components/common/ImageUploader';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ToastContainer, ToastMessage } from '../../components/common/Toast';

export const AdminChallengeEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const defaultChallenge: Challenge = {
    id: 'c_' + Date.now(),
    slug: '',
    title: '',
    date: '2026-11-02',
    month: 11,
    bannerUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    excerpt: '',
    description: '',
    requirements: '',
    applicableProducts: 'Sản phẩm Bán lẻ VRB',
    applicableFormat: 'Bài viết hoặc Video ngắn dưới 60 giây',
    officialHashtags: '#VRBCreator #SalesVRB',
    validConditions: 'Bài đăng ở chế độ Công khai (Public), gắn đúng hashtag chính thức.',
    prizeStructure: '01 Giải Nhất tuần: 1.000.000 VNĐ | 02 Giải Khuyến khích: 500.000 VNĐ',
    submissionGuide: 'Gửi link bài dự thi qua biểu mẫu tiếp nhận trước 23h59 Chủ nhật.',
    submissionFormUrl: '',
    status: 'draft',
    isFeaturedHome: false,
    winnersAnnouncement: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [formData, setFormData] = useState<Challenge>(defaultChallenge);
  const [loading, setLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, type, text }]);
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  useEffect(() => {
    if (!isNew && id) {
      getChallengeById(id).then((res) => {
        if (res) {
          setFormData(res);
        } else {
          addToast('error', 'Không tìm thấy dữ liệu thử thách.');
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  // Leave page guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleTitleChange = (val: string) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug && !isNew ? prev.slug : generateSlug(val),
    }));
  };

  const handleSave = async (statusOverride?: ContentStatus) => {
    if (!formData.title.trim()) {
      addToast('error', 'Vui lòng nhập tên thử thách.');
      return;
    }
    if (!formData.slug.trim()) {
      addToast('error', 'Vui lòng nhập slug đường dẫn.');
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave: Challenge = {
        ...formData,
        status: statusOverride || formData.status,
      };

      await saveChallenge(dataToSave);
      setIsDirty(false);
      addToast('success', 'Đã lưu thử thách thành công!');
      setTimeout(() => {
        navigate('/admin/challenges');
      }, 700);
    } catch (err) {
      console.error(err);
      addToast('error', 'Có lỗi xảy ra khi lưu dữ liệu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    try {
      await deleteChallenge(formData.id);
      addToast('success', `Đã xóa thử thách "${formData.title}" thành công.`);
      setShowDeleteModal(false);
      setTimeout(() => navigate('/admin/challenges'), 600);
    } catch (err) {
      console.error(err);
      addToast('error', 'Không thể xóa thử thách.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-vrb-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Đang tải biểu mẫu chỉnh sửa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {!isNew && <Link to={`/thu-thach/${formData.slug}`} target="_blank" rel="noopener noreferrer" className="inline-block text-vrb-blue underline text-sm">Xem thử thách đã lưu ↗</Link>}
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/challenges"
            onClick={(e) => {
              if (isDirty && !window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang này?')) {
                e.preventDefault();
              }
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isNew ? 'Tạo Thử Thách Mới' : `Chỉnh sửa: ${formData.title}`}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isNew ? 'Nhập thông tin đề bài thử thách tuần mới' : 'Cập nhật nội dung, tiêu chí và người đạt giải'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
              title="Xóa thử thách này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('draft')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 shadow-2xs transition-colors"
          >
            Lưu bản nháp
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('published')}
            className="px-5 py-2.5 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Công bố thử thách'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Basic info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            1. Thông Tin Cơ Bản & Định Tuyến
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên thử thách *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ví dụ: Lên sóng là có cơ hội"
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Slug URL *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => {
                  setIsDirty(true);
                  setFormData({ ...formData, slug: e.target.value });
                }}
                placeholder="len-song-la-co-co-hoi"
                className="w-full text-sm font-mono border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày phát động</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setIsDirty(true);
                  const month = new Date(e.target.value).getMonth() + 1;
                  setFormData({ ...formData, date: e.target.value, month });
                }}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tháng</label>
              <select
                value={formData.month}
                onChange={(e) => {
                  setIsDirty(true);
                  setFormData({ ...formData, month: parseInt(e.target.value) });
                }}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              >
                <option value={11}>Tháng 11 / 2026</option>
                <option value={12}>Tháng 12 / 2026</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Trạng thái phát hành</label>
              <select
                value={formData.status}
                onChange={(e) => {
                  setIsDirty(true);
                  setFormData({ ...formData, status: e.target.value as ContentStatus });
                }}
                className="w-full text-sm font-bold border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              >
                <option value="published">Đã công bố (Hiển thị người xem)</option>
                <option value="draft">Bản nháp (Chỉ admin thấy)</option>
                <option value="hidden">Đã ẩn (Tạm ẩn khỏi trang)</option>
              </select>
            </div>
          </div>

          {/* Featured Pin Checkbox */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center gap-3">
            <input
              type="checkbox"
              id="isFeaturedHome"
              checked={formData.isFeaturedHome}
              onChange={(e) => {
                setIsDirty(true);
                setFormData({ ...formData, isFeaturedHome: e.target.checked });
              }}
              className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isFeaturedHome" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Ghim thử thách này làm TIÊU ĐIỂM trên Trang chủ</span>
            </label>
          </div>

          {/* Banner uploader */}
          <ImageUploader
            label="Ảnh bìa Banner Thử thách (Tỷ lệ khuyến nghị 16:9 hoặc 16:10)"
            value={formData.bannerUrl}
            onChange={(url) => {
              setIsDirty(true);
              setFormData({ ...formData, bannerUrl: url });
            }}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô tả ngắn (Hiển thị trên thẻ card)</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => {
                setIsDirty(true);
                setFormData({ ...formData, excerpt: e.target.value });
              }}
              placeholder="Tóm tắt ngắn gọn đề bài tuần này..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 outline-none focus:border-vrb-blue resize-none"
            />
          </div>
        </div>

        {/* Section 2: Detailed description with WYSIWYG editor */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            2. Chi Tiết Đề Bài & Ý Nghĩa Thử Thách
          </h2>

          <RichTextEditor
            label="Nội dung chi tiết thử thách"
            value={formData.description}
            onChange={(html) => {
              setIsDirty(true);
              setFormData({ ...formData, description: html });
            }}
          />
        </div>

        {/* Section 3: Requirements & Specifications */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            3. Yêu Cầu, Sản Phẩm & Hashtag Bắt Buộc
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Yêu cầu cụ thể của bài thi</label>
            <textarea
              rows={3}
              value={formData.requirements}
              onChange={(e) => {
                setIsDirty(true);
                setFormData({ ...formData, requirements: e.target.value });
              }}
              placeholder="Ví dụ: Đăng tối thiểu 01 video ngắn từ 15-45 giây..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 outline-none focus:border-vrb-blue resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Sản phẩm áp dụng</label>
              <input
                type="text"
                value={formData.applicableProducts}
                onChange={(e) => {
                  setIsDirty(true);
                  setFormData({ ...formData, applicableProducts: e.target.value });
                }}
                className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Định dạng áp dụng</label>
              <input
                type="text"
                value={formData.applicableFormat}
                onChange={(e) => {
                  setIsDirty(true);
                  setFormData({ ...formData, applicableFormat: e.target.value });
                }}
                className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Bộ Hashtag chính thức (bắt buộc)</label>
            <input
              type="text"
              value={formData.officialHashtags}
              onChange={(e) => {
                setIsDirty(true);
                setFormData({ ...formData, officialHashtags: e.target.value });
              }}
              placeholder="#VRBCreator #TenThuThach"
              className="w-full text-xs font-mono font-semibold text-vrb-red border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Điều kiện ghi nhận hợp lệ</label>
              <textarea
                rows={3}
                value={formData.validConditions}
                onChange={(e) => {
                  setIsDirty(true);
                  setFormData({ ...formData, validConditions: e.target.value });
                }}
                className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 outline-none focus:border-vrb-blue resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Cơ cấu giải thưởng tuần</label>
              <textarea
                rows={3}
                value={formData.prizeStructure}
                onChange={(e) => {
                  setIsDirty(true);
                  setFormData({ ...formData, prizeStructure: e.target.value });
                }}
                className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2 outline-none focus:border-vrb-blue resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Hướng dẫn gửi bài & Nộp link</label>
            <input
              type="text"
              value={formData.submissionGuide}
              onChange={(e) => {
                setIsDirty(true);
                setFormData({ ...formData, submissionGuide: e.target.value });
              }}
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
            />
          </div>

          <p className="text-xs text-slate-500">Nút nộp bài sử dụng form chung của website. Xem và xuất danh sách trong mục Bài dự thi đã gửi.</p>
        </div>

        {/* Section 4: Winners announcement if any */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            4. Kết Quả & Vinh Danh Người Đạt Giải (Sau khi kết thúc tuần)
          </h2>
          <RichTextEditor
            label="Thông báo danh sách thí sinh đạt giải tuần này"
            value={formData.winnersAnnouncement || ''}
            onChange={(html) => {
              setIsDirty(true);
              setFormData({ ...formData, winnersAnnouncement: html });
            }}
          />
        </div>

        {/* Bottom save bar */}
        <div className="flex items-center justify-between pt-4">
          <Link
            to="/admin/challenges"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            ← Hủy và quay lại danh sách
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave('draft')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 shadow-2xs"
            >
              Lưu bản nháp
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave('published')}
              className="px-6 py-2.5 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Công bố thử thách'}</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Xác nhận xóa thử thách"
        message="Hành động này sẽ xóa hoàn toàn thử thách này khỏi hệ thống."
        itemName={formData.title}
        confirmLabel="Xóa thử thách"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
