import { useAuth } from '../../hooks/useAuth';
import { SiteText, useSiteText } from '../common/SiteText';
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ShieldCheck, Send, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { isAuthenticated } from '../../services/authService';

export const Header: React.FC = () => {
  const text = useSiteText();
  const { programInfo } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRankDropdownOpen, setIsRankDropdownOpen] = useState(false);
  const isAuth = Boolean(useAuth().user);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-xs lg:text-sm font-medium transition-colors px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
      isActive
        ? 'text-vrb-red font-bold bg-red-50/70 border-b-2 border-vrb-red'
        : 'text-slate-700 hover:text-vrb-blue hover:bg-slate-50'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
      isActive ? 'bg-red-50 text-vrb-red font-bold' : 'text-slate-700 hover:bg-slate-50'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-20">
          {/* Logo Brand according to template wireframe */}
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            <img
              src={programInfo.logoUrl || '/assets/vrb-logo.png'}
              alt="Logo VRB"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-102"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/vrb-logo.png';
              }}
            />
            <div className="hidden sm:block min-w-0 border-l border-slate-300 pl-3">
              <span className="block text-sm font-extrabold tracking-tight text-vrb-blue-deep leading-snug truncate max-w-[22rem]">{programInfo.title}</span>
              <span className="text-[10px] text-vrb-red font-bold tracking-widest uppercase mt-0.5 block"><SiteText id="Header.2" /></span>
            </div>
          </Link>

          {/* Right Action Buttons */}
          <div className="hidden xl:flex shrink-0 items-center gap-3">
            {programInfo.isSubmissionActive ? (
              <a
                href="/gui-bai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-vrb-red hover:bg-vrb-red-dark shadow-sm transition-all hover:scale-102"
              >
                <Send className="w-3.5 h-3.5" />
                <span><SiteText id="Header.15" /></span>
              </a>
            ) : null}

            <Link
              to="/admin" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-vrb-blue bg-slate-100 hover:bg-slate-200/80 transition-colors"
              title="Mở khu vực quản trị trong tab mới"
            >
              <ShieldCheck className="w-4 h-4 text-vrb-blue" />
              <span>{isAuth ? text("Header.extra1") : text("Header.extra2")}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex shrink-0 items-center gap-2 xl:hidden">
            <Link
              to="/admin" target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              title="Admin login"
            >
              <ShieldCheck className="w-5 h-5 text-vrb-blue" />
            </Link>
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
          {/* Desktop Navigation Links */}
          <nav aria-label="Điều hướng chính" className="hidden xl:flex flex-wrap items-center justify-center gap-x-1 gap-y-2 border-t border-slate-100 py-3">
            <NavLink to="/" end className={navLinkClass}><SiteText id="Header.3" /></NavLink>
            <NavLink to="/chuong-trinh" className={navLinkClass}><SiteText id="Header.4" /></NavLink>
            <NavLink to="/thu-thach" className={navLinkClass}><SiteText id="Header.5" /></NavLink>
            <NavLink to="/the-le" className={navLinkClass}><SiteText id="Header.6" /></NavLink>
            <NavLink to="/dieu-khoan" className={navLinkClass}><SiteText id="Header.7" /></NavLink>
            <NavLink to="/huong-dan" className={navLinkClass}><SiteText id="Header.8" /></NavLink>
            <NavLink to="/giai-thuong" className={navLinkClass}><SiteText id="Header.9" /></NavLink>
            <NavLink to="/noi-dung-noi-bat" className={navLinkClass}><SiteText id="Header.10" /></NavLink>

            {/* Bảng xếp hạng Dropdown */}
            <div className="relative" onMouseLeave={() => setIsRankDropdownOpen(false)}>
              <button
                type="button"
                aria-expanded={isRankDropdownOpen}
                onClick={() => setIsRankDropdownOpen(!isRankDropdownOpen)}
                onMouseEnter={() => setIsRankDropdownOpen(true)}
                className="flex items-center gap-1 text-xs lg:text-sm font-medium text-slate-700 hover:text-vrb-blue px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span><SiteText id="Header.11" /></span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isRankDropdownOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
                  <NavLink
                    to="/xep-hang/ca-nhan"
                    className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-vrb-blue"
                    onClick={() => setIsRankDropdownOpen(false)}
                  ><SiteText id="Header.12" /></NavLink>
                  <NavLink
                    to="/xep-hang/tap-the"
                    className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-vrb-blue"
                    onClick={() => setIsRankDropdownOpen(false)}
                  ><SiteText id="Header.13" /></NavLink>
                </div>
              )}
            </div>

            <NavLink to="/cong-dong" className={navLinkClass}><SiteText id="Header.14" /></NavLink>
          </nav>

      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto animate-fade-in">
          <NavLink to="/" end className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}><SiteText id="Header.16" /></NavLink>
          <NavLink to="/chuong-trinh" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}><SiteText id="Header.17" /></NavLink>
          <NavLink to="/thu-thach" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}><SiteText id="Header.18" /></NavLink>
          <NavLink to="/the-le" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}><SiteText id="Header.19" /></NavLink>
          <NavLink to="/dieu-khoan" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}><SiteText id="Header.20" /></NavLink>
          <NavLink to="/huong-dan" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}><SiteText id="Header.21" /></NavLink>
          <NavLink to="/giai-thuong" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}><SiteText id="Header.22" /></NavLink>
          <NavLink to="/noi-dung-noi-bat" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}><SiteText id="Header.23" /></NavLink>
          <NavLink to="/xep-hang/ca-nhan" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}><SiteText id="Header.24" /></NavLink>
          <NavLink to="/xep-hang/tap-the" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}><SiteText id="Header.25" /></NavLink>
          <NavLink to="/cong-dong" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}><SiteText id="Header.26" /></NavLink>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {programInfo.isSubmissionActive && (
              <a
                href="/gui-bai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-white bg-vrb-red hover:bg-vrb-red-dark shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /><SiteText id="Header.27" /></a>
            )}
            <Link
              to="/admin" target="_blank" rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-vrb-blue" />
              <span>{isAuth ? text("Header.extra3") : text("Header.extra4")}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
