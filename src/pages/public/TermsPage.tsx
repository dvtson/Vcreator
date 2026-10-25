import { useStoredRecord } from '../../hooks/useStoredRecord';
import { DocumentDownload } from '../../components/common/PDFAttachment';
import { SiteText, useSiteText } from '../../components/common/SiteText';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { getPageDocument } from '../../services/storageService';
import { PageDocument } from '../../types';
import { SafeHTML } from '../../components/common/SafeHTML';

export const TermsPage: React.FC = () => {
  const text = useSiteText();
  const { value: doc } = useStoredRecord(() => getPageDocument('dieu-khoan'), 'dieu-khoan');


  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-vrb-blue"><SiteText id="TermsPage.1" /></Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold"><SiteText id="TermsPage.2" /></span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-vrb-blue font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" /><SiteText id="TermsPage.3" /></span>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{doc?.versionName || text("TermsPage.extra1")}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /><SiteText id="TermsPage.4" />{doc?.updatedDate || '15/10/2026'}
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {doc?.title || text("TermsPage.extra2")}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed"><SiteText id="TermsPage.5" /></p>
        </div>

        {/* Dynamic Rich Text */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
          {doc?.contentHtml ? (
            <><SafeHTML html={doc.contentHtml} /><DocumentDownload doc={doc} /></>
          ) : (
            <p className="text-slate-400 italic"><SiteText id="TermsPage.6" /></p>
          )}

          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/the-le"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-vrb-blue hover:text-vrb-blue-dark"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" /><SiteText id="TermsPage.7" /></Link>
            <Link
              to="/huong-dan"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            ><SiteText id="TermsPage.8" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
};
