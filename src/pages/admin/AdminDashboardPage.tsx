import { cloudEnabled } from '../../services/firebase';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Video,
  Users,
  Trophy,
  FileText,
  HelpCircle,
  Database,
  ArrowRight,
  ExternalLink,
  Sparkles,
  BarChart3,
  Settings
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AdminDashboardPage: React.FC = () => {
  const { allChallenges, allFeaturedContents, allFeaturedIndividuals, allAwards, allFaqs, leaderboards } = useData();

  const publishedChallenges = allChallenges.filter((c) => c.status === 'published');
  const draftChallenges = allChallenges.filter((c) => c.status === 'draft');
  const hiddenChallenges = allChallenges.filter((c) => c.status === 'hidden');

  const publishedVideos = allFeaturedContents.filter((c) => c.status === 'published');

  const totalAwardsValue = allAwards.reduce((acc, a) => acc + (a.totalEstimated || 0), 0);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';
  };

  const statCards = [
    {
      title: 'Thử thách Thứ Hai',
      value: allChallenges.length,
      detail: `${publishedChallenges.length} đã công bố • ${draftChallenges.length} nháp • ${hiddenChallenges.length} ẩn`,
      icon: Flame,
      color: 'bg-red-50 text-vrb-red border-red-200',
      link: '/admin/challenges',
    },
    {
      title: 'Nội dung & Video',
      value: allFeaturedContents.length,
      detail: `${publishedVideos.length} bài đăng hiển thị ra ngoài`,
      icon: Video,
      color: 'bg-blue-50 text-vrb-blue border-blue-200',
      link: '/admin/content',
    },
    {
      title: 'Top Cá nhân Vinh danh',
      value: allFeaturedIndividuals.length,
      detail: 'Gương mặt truyền cảm hứng Sales',
      icon: Users,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      link: '/admin/top-individuals',
    },
    {
      title: 'Hạng mục Giải thưởng',
      value: allAwards.length,
      detail: `Chi tiết: ${formatVND(totalAwardsValue)}`,
      icon: Trophy,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      link: '/admin/awards',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-vrb-blue-deep via-vrb-blue to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-amber-300 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" /> Bảng điều khiển Quản trị
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào Quản trị viên VRB!
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Hệ thống quản lý nội dung chiến dịch <strong>VRB CREATOR: Sáng tạo mỗi ngày – Lan tỏa cùng VRB</strong>. {cloudEnabled?'Nội dung được đồng bộ qua Firestore.':'Nội dung đang lưu trên trình duyệt này, chờ duyệt bước chuyển cloud.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/challenges/new"
            className="px-4 py-2.5 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4" /> Thêm thử thách mới
          </Link>
          <Link
            to="/"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <span>Xem trang CBNV</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Link
            key={i}
            to={card.link}
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 group-hover:text-vrb-blue transition-colors">
                {card.value}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">{card.detail}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Content Management */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-vrb-blue" /> Quản lý Nội dung & Quy định
          </h2>
          <div className="space-y-2 text-xs">
            <Link
              to="/admin/info"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div>
                <strong className="block text-slate-900 text-sm">Thông tin chương trình & Liên hệ</strong>
                <span className="text-slate-500">Tiêu đề, slogan, hotline, link Form, nhóm Zalo</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/pages"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div>
                <strong className="block text-slate-900 text-sm">Biên tập Thể lệ & Điều khoản</strong>
                <span className="text-slate-500">Trình soạn thảo WYSIWYG, lưu nháp & công bố</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/faqs"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div>
                <strong className="block text-slate-900 text-sm">Hướng dẫn & Câu hỏi thường gặp</strong>
                <span className="text-slate-500">Quản lý danh sách câu hỏi FAQ và phân loại</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Right Column: Competition & Database */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-vrb-red" /> Thi đua, Xếp hạng & Cơ sở dữ liệu
          </h2>
          <div className="space-y-2 text-xs">
            <Link
              to="/admin/leaderboards"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div>
                <strong className="block text-slate-900 text-sm">Cập nhật Bảng xếp hạng</strong>
                <span className="text-slate-500">Quản lý điểm số cá nhân và tập thể theo từng kỳ</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/content"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div>
                <strong className="block text-slate-900 text-sm">Quản lý Video & Kiểm tra liên kết</strong>
                <span className="text-slate-500">Xem trước 3 video mẫu và cập nhật link TikTok/Reel</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/backup"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div>
                <strong className="block text-slate-900 text-sm">Sao lưu & Khôi phục dữ liệu mẫu</strong>
                <span className="text-slate-500">Xuất/nhập file JSON và reset hệ thống</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
