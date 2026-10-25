import { useStoredRecord } from '../../hooks/useStoredRecord';
import { DocumentDownload } from '../../components/common/PDFAttachment';
import { SiteText, useSiteText } from '../../components/common/SiteText';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Target, ShieldCheck, ArrowRight, Share2, Sparkles, Send } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getPageDocument } from '../../services/storageService';
import { PageDocument } from '../../types';
import { SafeHTML } from '../../components/common/SafeHTML';

export const AboutPage: React.FC = () => {
  const text = useSiteText();
  const { programInfo } = useData();
  const { value: doc } = useStoredRecord(() => getPageDocument('chuong-trinh'), 'chuong-trinh');


  return (
    <div className="py-12 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-vrb-blue"><SiteText id="AboutPage.1" /></Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold"><SiteText id="AboutPage.2" /></span>
        </nav>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-vrb-red font-bold text-xs mb-4">
            <Sparkles className="w-3.5 h-3.5" /><SiteText id="AboutPage.3" /></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {doc?.title || text("AboutPage.extra1")}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed mb-6">
            <strong><SiteText id="AboutPage.4" /></strong><SiteText id="AboutPage.5" /></p>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1"><SiteText id="AboutPage.6" /></span>
              <strong className="text-slate-800 text-sm block"><SiteText id="AboutPage.7" /></strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1"><SiteText id="AboutPage.8" /></span>
              <strong className="text-slate-800 text-sm block"><SiteText id="AboutPage.9" /></strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1"><SiteText id="AboutPage.10" /></span>
              <strong className="text-vrb-red text-sm block"><SiteText id="AboutPage.11" /></strong>
            </div>
          </div>
        </div>

        {/* Dynamic Rich Text Content managed from Admin */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
          {doc?.contentHtml ? (
            <><SafeHTML html={doc.contentHtml} /><DocumentDownload doc={doc} /></>
          ) : (
            <p className="text-slate-400 italic"><SiteText id="AboutPage.12" /></p>
          )}

          {/* Bottom Action Section */}
          <div className="pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/the-le"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-vrb-blue hover:text-vrb-blue-dark"
            ><SiteText id="AboutPage.13" /><ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {programInfo.isSubmissionActive && (
              <a
                href="/gui-bai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /><SiteText id="AboutPage.14" /></a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
