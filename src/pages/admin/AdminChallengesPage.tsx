import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Star,
  Eye,
  EyeOff,
  ExternalLink,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { saveChallenge, deleteChallenge } from '../../services/storageService';
import { Challenge, ContentStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ToastContainer, ToastMessage } from '../../components/common/Toast';

export const AdminChallengesPage: React.FC = () => {
  const navigate = useNavigate();
  const { allChallenges } = useData();

  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');

  // Deletion modal state
  const [deletingChallenge, setDeletingChallenge] = useState<Challenge | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTogglePin = async (challenge: Challenge) => {
    try {
      await saveChallenge({
        ...challenge,
        isFeaturedHome: !challenge.isFeaturedHome,
      });
      addToast(
        'success',
        challenge.isFeaturedHome
          ? `Đã bỏ ghim thử thách "${challenge.title}" khỏi Trang chủ`
          : `Đã ghim thử thách "${challenge.title}" làm Tiêu điểm Trang chủ`
      );
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi cập nhật trạng thái ghim.');
    }
  };

  const handleToggleStatus = async (challenge: Challenge, newStatus: ContentStatus) => {
    try {
      await saveChallenge({
        ...challenge,
        status: newStatus,
      });
      addToast('success', `Đã chuyển trạng thái sang "${newStatus === 'published' ? 'Công bố' : newStatus === 'draft' ? 'Bản nháp' : 'Đã ẩn'}"`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi cập nhật trạng thái.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingChallenge) return;
    try {
      await deleteChallenge(deletingChallenge.id);
      addToast('success', `Đã xóa thử thách "${deletingChallenge.title}" thành công!`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Có lỗi xảy ra khi xóa thử thách.');
    } finally {
      setDeletingChallenge(null);
    }
  };

  const filtered = useMemo(() => {
    return allChallenges.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.slug.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (monthFilter !== 'all' && c.month !== monthFilter) {
        return false;
      }
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [allChallenges, search, monthFilter, statusFilter]);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý 8 Thử thách Thứ Hai
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thêm mới, sửa nội dung, ghim tiêu điểm trang chủ, lưu nháp hoặc ẩn/công bố thử thách.
          </p>
        </div>

        <Link
          to="/admin/challenges/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm thử thách mới</span>
        </Link>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-vrb-blue focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Month filter */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:border-vrb-blue"
          >
            <option value="all">Tất cả các tháng</option>
            <option value={11}>Tháng 11/2026</option>
            <option value={12}>Tháng 12/2026</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:border-vrb-blue"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã công bố</option>
            <option value="draft">Bản nháp</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* Challenges Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                <th className="py-3.5 px-4 w-12 text-center">Ghim</th>
                <th className="py-3.5 px-4">Tên thử thách & Banner</th>
                <th className="py-3.5 px-4">Ngày phát động</th>
                <th className="py-3.5 px-4">Trạng thái công bố</th>
                <th className="py-3.5 px-4">Cơ cấu thưởng</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Pin to Home button */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePin(c)}
                      title={c.isFeaturedHome ? 'Bỏ ghim tiêu điểm' : 'Ghim làm tiêu điểm Trang chủ'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        c.isFeaturedHome
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                          : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${c.isFeaturedHome ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </td>

                  {/* Title and Thumbnail */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.bannerUrl}
                        alt={c.title}
                        className="w-12 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs hover:text-vrb-blue">
                          {c.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">/{c.slug}</span>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(c.date)}</span>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <select
                      value={c.status}
                      onChange={(e) => handleToggleStatus(c, e.target.value as ContentStatus)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer outline-none ${
                        c.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : c.status === 'draft'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      <option value="published">Đã công bố</option>
                      <option value="draft">Bản nháp</option>
                      <option value="hidden">Đã ẩn</option>
                    </select>
                  </td>

                  {/* Prize */}
                  <td className="py-3.5 px-4 text-xs font-semibold text-vrb-red truncate max-w-xs">
                    {c.prizeStructure?.split('|')[0] || '1.000.000 VNĐ'}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/thu-thach/${c.slug}`}
                        target="_blank"
                        title="Xem trang người dùng"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-vrb-blue hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to={`/admin/challenges/${c.id}`}
                        title="Chỉnh sửa nội dung"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-vrb-blue hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeletingChallenge(c)}
                        title="Xóa thử thách"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Không tìm thấy thử thách nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Deletion with Entity Name */}
      <ConfirmModal
        isOpen={!!deletingChallenge}
        title="Xác nhận xóa thử thách"
        message="Hành động này sẽ xóa hoàn toàn thử thách khỏi hệ thống dữ liệu. Người xem sẽ không thể truy cập lại trang thử thách này."
        itemName={deletingChallenge?.title}
        confirmLabel="Xóa thử thách"
        cancelLabel="Giữ lại"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingChallenge(null)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
