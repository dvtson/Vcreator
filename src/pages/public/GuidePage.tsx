import { useStoredRecord } from '../../hooks/useStoredRecord';
import { DocumentDownload } from '../../components/common/PDFAttachment';
import { SiteText, useSiteText } from '../../components/common/SiteText';
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  Calendar,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getPageDocument } from '../../services/storageService';
import { PageDocument } from '../../types';
import { SafeHTML } from '../../components/common/SafeHTML';

export const GuidePage: React.FC = () => {
  const text = useSiteText();
  const { faqs, programInfo } = useData();
  const { value: guideDoc } = useStoredRecord(() => getPageDocument('huong-dan'), 'huong-dan');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['faq-1']);


  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-vrb-blue"><SiteText id="GuidePage.1" /></Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold"><SiteText id="GuidePage.2" /></span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /><SiteText id="GuidePage.3" /></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4"><SiteText id="GuidePage.4" /></h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6"><SiteText id="GuidePage.5" /></p>

          {/* Quick Step Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-vrb-blue text-white font-bold flex items-center justify-center text-[10px] mb-1.5"><SiteText id="GuidePage.6" /></span>
              <strong className="text-slate-800 block"><SiteText id="GuidePage.7" /></strong>
              <span className="text-slate-500 text-[11px]"><SiteText id="GuidePage.8" /></span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-vrb-blue text-white font-bold flex items-center justify-center text-[10px] mb-1.5"><SiteText id="GuidePage.9" /></span>
              <strong className="text-slate-800 block"><SiteText id="GuidePage.10" /></strong>
              <span className="text-slate-500 text-[11px]"><SiteText id="GuidePage.11" /></span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-vrb-blue text-white font-bold flex items-center justify-center text-[10px] mb-1.5"><SiteText id="GuidePage.12" /></span>
              <strong className="text-slate-800 block"><SiteText id="GuidePage.13" /></strong>
              <span className="text-slate-500 text-[11px]"><SiteText id="GuidePage.14" /></span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-vrb-red text-white font-bold flex items-center justify-center text-[10px] mb-1.5"><SiteText id="GuidePage.15" /></span>
              <strong className="text-slate-800 block"><SiteText id="GuidePage.16" /></strong>
              <span className="text-slate-500 text-[11px]"><SiteText id="GuidePage.17" /></span>
            </div>
          </div>
        </div>

        {/* Step Guide Detailed Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-vrb-blue" /><SiteText id="GuidePage.18" /></h2>
          {guideDoc?.contentHtml ? (
            <><SafeHTML html={guideDoc.contentHtml} /><DocumentDownload doc={guideDoc} /></>
          ) : (
            <p className="text-slate-400 italic"><SiteText id="GuidePage.19" /></p>
          )}

          {programInfo.isSubmissionActive && (
            <div className="mt-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <strong className="text-sm font-bold text-red-900 block mb-1"><SiteText id="GuidePage.20" /></strong>
                <span className="text-xs text-red-700"><SiteText id="GuidePage.21" /></span>
              </div>
              <a
                href="/gui-bai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-vrb-red hover:bg-vrb-red-dark text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" /><SiteText id="GuidePage.22" /></a>
            </div>
          )}
        </div>

        {/* FAQ Accordion Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-amber-500" /><SiteText id="GuidePage.23" /></h2>
              <p className="text-xs text-slate-500 mt-1"><SiteText id="GuidePage.24" /></p>
            </div>

            {/* Search Input */}
            <div className="relative sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm câu hỏi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-vrb-blue"
              />
            </div>
          </div>

          {/* Accordion list */}
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 bg-slate-50 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-vrb-blue flex-shrink-0">
                        {faq.category || text("GuidePage.extra1")}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {faq.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-400 italic"><SiteText id="GuidePage.25" />{searchQuery}".
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
