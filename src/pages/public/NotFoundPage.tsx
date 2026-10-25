import { SiteText } from '../../components/common/SiteText';
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-slate-50">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-vrb-red flex items-center justify-center mx-auto mb-2">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold text-vrb-red uppercase tracking-widest block"><SiteText id="NotFoundPage.1" /></span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"><SiteText id="NotFoundPage.2" /></h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto"><SiteText id="NotFoundPage.3" /></p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 bg-vrb-blue hover:bg-vrb-blue-dark text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" /><SiteText id="NotFoundPage.4" /></Link>
          <Link
            to="/thu-thach"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          ><SiteText id="NotFoundPage.5" /></Link>
        </div>
      </div>
    </div>
  );
};
