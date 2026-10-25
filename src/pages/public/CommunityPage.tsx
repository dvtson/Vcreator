import { SiteText } from '../../components/common/SiteText';
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Phone, Mail, Send, ExternalLink, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const CommunityPage: React.FC = () => {
  const { programInfo } = useData();

  const isZaloAvailable = programInfo.isZaloActive && programInfo.zaloGroupUrl && programInfo.zaloGroupUrl.startsWith('http');
  const isFormAvailable = programInfo.isSubmissionActive;

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-vrb-blue"><SiteText id="CommunityPage.1" /></Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold"><SiteText id="CommunityPage.2" /></span>
        </nav>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-vrb-blue font-bold text-xs mb-4">
            <Sparkles className="w-3.5 h-3.5" /><SiteText id="CommunityPage.3" /></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4"><SiteText id="CommunityPage.4" /></h1>
          <p className="text-sm text-slate-600 leading-relaxed"><SiteText id="CommunityPage.5" /></p>
        </div>

        {/* 2 Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card Zalo */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2"><SiteText id="CommunityPage.6" /></h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6"><SiteText id="CommunityPage.7" /></p>
            </div>

            <div>
              {isZaloAvailable ? (
                <a
                  href={programInfo.zaloGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#0068FF] hover:bg-[#0052cc] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span><SiteText id="CommunityPage.8" /></span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed border border-slate-200 flex items-center justify-center gap-2"
                >
                  <span><SiteText id="CommunityPage.9" /></span>
                </button>
              )}
            </div>
          </div>

          {/* Card Biểu Mẫu Nộp Bài */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-vrb-red flex items-center justify-center mb-4">
                <Send className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2"><SiteText id="CommunityPage.10" /></h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6"><SiteText id="CommunityPage.11" /></p>
            </div>

            <div>
              {isFormAvailable ? (
                <a
                  href="/gui-bai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-vrb-red hover:bg-vrb-red-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span><SiteText id="CommunityPage.12" /></span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed border border-slate-200 flex items-center justify-center gap-2"
                >
                  <span><SiteText id="CommunityPage.13" /></span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contact details appear only after Admin supplies them. */}
        {(programInfo.hotline || programInfo.supportEmail || programInfo.supportContact) && <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3"><SiteText id="CommunityPage.14" /></h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {programInfo.hotline && <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-vrb-red" /><SiteText id="CommunityPage.15" /></span>
              <strong className="text-slate-900 text-sm block">{programInfo.hotline}</strong>
              <span className="text-slate-500 text-[11px]"><SiteText id="CommunityPage.16" /></span>
            </div>}

            {(programInfo.supportEmail || programInfo.supportContact) && <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-vrb-blue" /><SiteText id="CommunityPage.17" /></span>
              <strong className="text-slate-900 text-sm block">{programInfo.supportEmail}</strong>
              <span className="text-slate-500 text-[11px]">{programInfo.supportContact}</span>
            </div>}
          </div>
        </div>}
      </div>
    </div>
  );
};
