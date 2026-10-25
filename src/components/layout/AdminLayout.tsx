import { useData } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { AdminTransferBar } from '../common/AdminTransferBar';
import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  Flame,
  FileText,
  HelpCircle,
  Trophy,
  Users,
  Video,
  BarChart3,
  Database,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { isAuthenticated, logout, getCurrentUser } from '../../services/authService';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const authState = useAuth();
  const { loading, loadError, refreshData } = useData();
  const [logoutError, setLogoutError] = useState('');
  if (!authState.ready) return <div role="status" className="p-12 text-center">Đang xác minh phiên đăng nhập…</div>;

  // Authentication Guard: if not authenticated, redirect to /admin/login
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const currentUser = getCurrentUser();
  if (currentUser?.role === 'reviewer' && location.pathname !== '/admin/submissions') return <Navigate to="/admin/submissions" replace />;
  if (location.pathname === '/admin/accounts' && currentUser?.role !== 'super_admin') return <Navigate to="/admin" replace />;

  const handleLogout = async () => {
    try { await logout(); navigate('/admin/login', { replace: true }); }
    catch { setLogoutError('Không thể đăng xuất. Kiểm tra mạng và thử lại.'); }
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-vrb-blue text-white shadow-sm shadow-blue-900/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const navItems = [
    { to: '/admin', end: true, label: 'Tổng quan hệ thống', icon: LayoutDashboard },
    { to: '/admin/info', label: 'Thông tin chương trình', icon: Settings },
    { to: '/admin/challenges', label: 'Quản lý Thử thách', icon: Flame },
    { to: '/admin/pages', label: 'Thể lệ & Điều khoản', icon: FileText },
    { to: '/admin/faqs', label: 'Hướng dẫn & FAQ', icon: HelpCircle },
    { to: '/admin/awards', label: 'Cơ cấu Giải thưởng', icon: Trophy },
    { to: '/admin/top-individuals', label: 'Top 5 Cá nhân', icon: Users },
    { to: '/admin/submissions', label: 'Bài dự thi đã gửi', icon: FileText },
    { to: '/admin/content', label: 'Nội dung & Video', icon: Video },
    { to: '/admin/leaderboards', label: 'Bảng xếp hạng', icon: BarChart3 },
    { to: '/admin/site-text', label: 'Nội dung giao diện', icon: FileText },
    { to: '/admin/backup', label: 'Dữ liệu & Sao lưu', icon: Database },
    { to: '/admin/accounts', label: 'Tài khoản & Phân quyền', icon: UserCheck },
  ].filter(item => currentUser?.role === 'reviewer' ? item.to === '/admin/submissions' : item.to !== '/admin/accounts' || currentUser?.role === 'super_admin');

  return (
    <div className="admin-shell h-screen min-h-0 flex overflow-hidden bg-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 shadow-xs flex-shrink-0 min-h-0">
        {/* Brand header */}
        <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-100">
          <img src="/assets/vrb-logo.png" alt="VRB" className="h-9 w-auto object-contain" />
          <div>
            <span className="block font-extrabold text-sm text-vrb-blue-deep leading-tight">
              VRB ADMIN
            </span>
            <span className="text-[10px] font-bold text-vrb-red tracking-wide uppercase">
              Quản trị nội dung
            </span>
          </div>
        </div>

        {/* User bar */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-vrb-blue/10 text-vrb-blue flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-slate-800 truncate">
                {currentUser?.username || 'Admin'}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đang trực tuyến
              </span>
            </div>
          </div>
          <Link
            to="/"
            target="_blank"
            title="Mở trang người xem trong tab mới"
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navItemClass}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar for Mobile & Header info */}
        <header className="min-h-16 shrink-0 bg-white border-b border-slate-200 px-3 py-3 sm:px-6 flex items-center justify-between gap-2 lg:justify-end">
          <button
            aria-label="Mở menu quản trị"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
            <Link
              to="/" target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-600 hover:text-vrb-blue flex items-center gap-1.5 py-1 px-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white shadow-2xs"
            >
              <span>Xem website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:text-red-700 p-2 flex items-center gap-1"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 min-h-0 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {logoutError && <p role="alert" className="bg-red-50 text-red-700 rounded-xl p-3 mb-4">{logoutError}</p>}
          <AdminTransferBar key={location.pathname} />
          {loading ? <p role="status" className="p-8 text-center">Đang tải nội dung quản trị…</p> : loadError && location.pathname !== '/admin/backup' ? <div role="alert" className="bg-amber-50 border rounded-xl p-5 space-y-3"><p>{loadError}</p><button onClick={()=>refreshData()} className="text-vrb-blue underline">Thử lại</button><Link to="/admin/backup" className="block text-vrb-blue underline">Mở dữ liệu và sao lưu</Link></div> : <Outlet />}
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10">
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img src="/assets/vrb-logo.png" alt="VRB" className="h-7 w-auto" />
                <span className="font-bold text-sm text-slate-800">VRB ADMIN</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={navItemClass}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-3 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
