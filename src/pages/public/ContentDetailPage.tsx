import { useStoredRecord } from '../../hooks/useStoredRecord';
import { SiteText, useSiteText } from '../../components/common/SiteText';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ExternalLink,
  ArrowLeft,
  User,
  Building,
  Calendar,
  AlertTriangle,
  Play,
  Share2,
  Tag
} from 'lucide-react';
import { getFeaturedContentById } from '../../services/storageService';
import { FeaturedContent } from '../../types';
import { Badge } from '../../components/common/Badge';

export const ContentDetailPage: React.FC = () => {
  const text = useSiteText();
  const { id } = useParams<{ id: string }>();
  const { value: content, loading } = useStoredRecord(() => getFeaturedContentById(id || ''), id || '');


  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-vrb-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500"><SiteText id="ContentDetailPage.1" /></p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="py-24 max-w-md mx-auto text-center px-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2"><SiteText id="ContentDetailPage.2" /></h2>
        <p className="text-xs text-slate-500 mb-6"><SiteText id="ContentDetailPage.3" /></p>
        <Link
          to="/noi-dung-noi-bat"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-vrb-blue text-white rounded-xl text-xs font-semibold hover:bg-vrb-blue-dark"
        >
          <ArrowLeft className="w-4 h-4" /><SiteText id="ContentDetailPage.4" /></Link>
      </div>
    );
  }

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/noi-dung-noi-bat"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-vrb-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /><SiteText id="ContentDetailPage.5" /></Link>
          <div className="flex items-center gap-2">
            <Badge variant="platform" platform={content.platform} />
            <Badge variant="demo" />
          </div>
        </div>

        {/* Missing account alert if flagged */}
        {content.isMissingAccountNotice && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5"><SiteText id="ContentDetailPage.6" /></strong>
              <p className="text-amber-800 leading-relaxed"><SiteText id="ContentDetailPage.7" /><code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">@/</code><SiteText id="ContentDetailPage.8" /></p>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
          {/* Media Header / Video Player Area */}
          <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
            <img
              src={content.thumbnailUrl}
              alt={content.title}
              className="w-full h-full object-cover opacity-85"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80';
              }}
            />

            {/* Overlay CTA to original video */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center text-white">
              <a
                href={content.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-full bg-vrb-red hover:bg-vrb-red-dark text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all mb-4"
                title="Mở bài gốc trong tab mới"
              >
                <Play className="w-7 h-7 ml-1 fill-white" />
              </a>
              <h3 className="text-base sm:text-lg font-bold max-w-md drop-shadow-md mb-2"><SiteText id="ContentDetailPage.9" />{content.platform.toUpperCase()}
              </h3>
              <p className="text-xs text-slate-200 max-w-sm mb-4"><SiteText id="ContentDetailPage.10" /></p>
              <a
                href={content.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-md"
              >
                <span><SiteText id="ContentDetailPage.11" /></span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-10 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
                {content.title}
              </h1>

              {/* Author & Branch Info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <User className="w-4 h-4 text-vrb-blue" />
                  <span>{content.authorName}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>{content.branch}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-vrb-red" />
                  <span><SiteText id="ContentDetailPage.12" />{content.contentType === 'video' ? text("ContentDetailPage.extra1") : text("ContentDetailPage.extra2")}</span>
                </div>
              </div>
            </div>

            {/* Excerpt / Description */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2"><SiteText id="ContentDetailPage.13" /></h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {content.excerpt}
              </p>
            </div>

            {/* Note if any */}
            {content.note && (
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-800">
                <span className="font-semibold"><SiteText id="ContentDetailPage.14" /></span> {content.note}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <a
                href={content.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-vrb-blue hover:bg-vrb-blue-dark text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <span><SiteText id="ContentDetailPage.15" />{content.platform}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <Link
                to="/noi-dung-noi-bat"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              ><SiteText id="ContentDetailPage.16" /></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
