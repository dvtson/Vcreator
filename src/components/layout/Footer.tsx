import { SiteText } from '../common/SiteText';
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const Footer: React.FC = () => {
  const { programInfo } = useData();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Bank Brand & Program info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={programInfo.logoUrl || '/assets/vrb-logo.png'}
                alt="Logo VRB"
                className="h-10 w-auto bg-white p-1 rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/vrb-logo.png';
                }}
              />
              <div>
                <span className="block font-bold text-white text-sm">{programInfo.title}</span>
                <span className="text-xs text-vrb-red font-semibold"><SiteText id="Footer.2" /></span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed"><SiteText id="Footer.3" /><br />
              <strong className="text-slate-200"><SiteText id="Footer.4" /></strong>
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <p><SiteText id="Footer.5" /><span className="text-amber-400 font-semibold"><SiteText id="Footer.6" /></span></p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-vrb-red pl-2.5"><SiteText id="Footer.7" /></h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/chuong-trinh" className="hover:text-white transition-colors"><SiteText id="Footer.8" /></Link>
              </li>
              <li>
                <Link to="/thu-thach" className="hover:text-white transition-colors"><SiteText id="Footer.9" /></Link>
              </li>
              <li>
                <Link to="/the-le" className="hover:text-white transition-colors"><SiteText id="Footer.10" /></Link>
              </li>
              <li>
                <Link to="/dieu-khoan" className="hover:text-white transition-colors"><SiteText id="Footer.11" /></Link>
              </li>
              <li>
                <Link to="/giai-thuong" className="hover:text-white transition-colors"><SiteText id="Footer.12" /></Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Bảng xếp hạng & Cộng đồng */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-vrb-blue pl-2.5"><SiteText id="Footer.13" /></h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/noi-dung-noi-bat" className="hover:text-white transition-colors"><SiteText id="Footer.14" /></Link>
              </li>
              <li>
                <Link to="/xep-hang/ca-nhan" className="hover:text-white transition-colors"><SiteText id="Footer.15" /></Link>
              </li>
              <li>
                <Link to="/xep-hang/tap-the" className="hover:text-white transition-colors"><SiteText id="Footer.16" /></Link>
              </li>
              <li>
                <Link to="/huong-dan" className="hover:text-white transition-colors"><SiteText id="Footer.17" /></Link>
              </li>
              <li>
                <Link to="/cong-dong" className="hover:text-white transition-colors"><SiteText id="Footer.18" /></Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Admin */}
          <div>
            <div className="mt-5 pt-3 border-t border-slate-800">
              <Link
                to="/admin" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1 px-2.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-vrb-blue" />
                <span><SiteText id="Footer.23" /></span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Note & Disclaimer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p><SiteText id="Footer.24" /></p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700"><SiteText id="Footer.25" /></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
