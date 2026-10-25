import { challengeTimeStatus } from '../../services/dates';
import { useStoredRecord } from '../../hooks/useStoredRecord';
import { SiteText, useSiteText } from '../../components/common/SiteText';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Send,
  ArrowLeft,
  Copy,
  Check,
  Trophy,
  Tag,
  Clock,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Share2
} from 'lucide-react';
import { getChallengeBySlug } from '../../services/storageService';
import { Challenge, TimeStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { SafeHTML } from '../../components/common/SafeHTML';
import { useData } from '../../context/DataContext';

export const ChallengeDetailPage: React.FC = () => {
  const text = useSiteText();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { programInfo } = useData();
  const { value: challenge, loading } = useStoredRecord(() => getChallengeBySlug(slug || ''), slug || '');
  const [copiedHashtags, setCopiedHashtags] = useState(false);


  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-vrb-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500"><SiteText id="ChallengeDetailPage.1" /></p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="py-24 max-w-md mx-auto text-center px-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2"><SiteText id="ChallengeDetailPage.2" /></h2>
        <p className="text-xs text-slate-500 mb-6"><SiteText id="ChallengeDetailPage.3" /></p>
        <Link
          to="/thu-thach"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-vrb-blue text-white rounded-xl text-xs font-semibold hover:bg-vrb-blue-dark"
        >
          <ArrowLeft className="w-4 h-4" /><SiteText id="ChallengeDetailPage.4" /></Link>
      </div>
    );
  }

  const getTimeStatus = challengeTimeStatus;

  const timeStatus = getTimeStatus(challenge.date);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const calculateEndDate = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 6);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleCopyHashtags = () => {
    if (!challenge.officialHashtags) return;
    navigator.clipboard.writeText(challenge.officialHashtags);
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2500);
  };

  const formUrl = programInfo.isSubmissionActive ? '/gui-bai' : '';

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/thu-thach"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-vrb-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /><SiteText id="ChallengeDetailPage.5" /></Link>
          <Badge variant="time" timeStatus={timeStatus} />
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full bg-slate-900 overflow-hidden">
            <img
              src={challenge.bannerUrl}
              alt={challenge.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-6 sm:p-10">
              <div className="text-white space-y-2 max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Calendar className="w-4 h-4" />
                  <span><SiteText id="ChallengeDetailPage.6" />{challenge.month === 11 ? text("ChallengeDetailPage.extra1") : text("ChallengeDetailPage.extra2")}<SiteText id="ChallengeDetailPage.7" /></span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  {challenge.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Quick specs ribbon */}
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-4 border-b border-slate-100 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50/70 text-xs">
            <div className="p-4">
              <span className="text-slate-400 block mb-0.5"><SiteText id="ChallengeDetailPage.8" /></span>
              <strong className="text-slate-800 text-sm">{formatDate(challenge.date)}</strong>
            </div>
            <div className="p-4">
              <span className="text-slate-400 block mb-0.5"><SiteText id="ChallengeDetailPage.9" /></span>
              <strong className="text-vrb-red text-sm"><SiteText id="ChallengeDetailPage.10" />{calculateEndDate(challenge.date)}</strong>
            </div>
            <div className="p-4">
              <span className="text-slate-400 block mb-0.5"><SiteText id="ChallengeDetailPage.11" /></span>
              <strong className="text-slate-800 truncate block">{challenge.applicableFormat || text("ChallengeDetailPage.extra3")}</strong>
            </div>
            <div className="p-4">
              <span className="text-slate-400 block mb-0.5"><SiteText id="ChallengeDetailPage.12" /></span>
              <strong className="text-vrb-blue truncate block">{challenge.prizeStructure?.split('|')[0] || text("ChallengeDetailPage.extra4")}</strong>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 border-l-3 border-vrb-red pl-3"><SiteText id="ChallengeDetailPage.13" /></h3>
              <SafeHTML html={challenge.description || challenge.excerpt} />
            </div>

            {/* Detailed Requirements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                <h4 className="text-sm font-bold text-vrb-blue flex items-center gap-2">
                  <FileCheck className="w-4 h-4" /><SiteText id="ChallengeDetailPage.14" /></h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {challenge.requirements}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-vrb-red" /><SiteText id="ChallengeDetailPage.15" /></h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {challenge.applicableProducts}
                </p>
              </div>
            </div>

            {/* Hashtag Box */}
            <div className="p-5 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-vrb-red block mb-1"><SiteText id="ChallengeDetailPage.16" /></span>
                <span className="font-mono text-xs sm:text-sm text-slate-800 font-semibold select-all">
                  {challenge.officialHashtags}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyHashtags}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2 flex-shrink-0"
              >
                {copiedHashtags ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700"><SiteText id="ChallengeDetailPage.17" /></span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span><SiteText id="ChallengeDetailPage.18" /></span>
                  </>
                )}
              </button>
            </div>

            {/* Conditions & Prizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2"><SiteText id="ChallengeDetailPage.19" /></h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {challenge.validConditions}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" /><SiteText id="ChallengeDetailPage.20" /></h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {challenge.prizeStructure}
                </p>
              </div>
            </div>

            {/* Winners Announcement if updated by Admin */}
            {challenge.winnersAnnouncement && (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-600" /><SiteText id="ChallengeDetailPage.21" /></h4>
                <SafeHTML html={challenge.winnersAnnouncement} className="text-emerald-800 text-xs" />
              </div>
            )}

            {/* How to submit & Action CTA */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1"><SiteText id="ChallengeDetailPage.22" /></h4>
                <SafeHTML html={challenge.submissionGuide} className="text-xs text-slate-600" />
              </div>
              {formUrl ? (
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span><SiteText id="ChallengeDetailPage.23" /></span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
