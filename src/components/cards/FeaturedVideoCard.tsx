import { SiteText } from '../common/SiteText';
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Play, AlertTriangle, Eye, User, Building } from 'lucide-react';
import { FeaturedContent } from '../../types';
import { Badge } from '../common/Badge';

interface FeaturedVideoCardProps {
  content: FeaturedContent;
}

export const FeaturedVideoCard: React.FC<FeaturedVideoCardProps> = ({ content }) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-vrb-blue/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail with overlay play button */}
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        <img
          src={content.thumbnailUrl}
          alt={content.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80';
          }}
        />

        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="platform" platform={content.platform} />
          <Badge variant="demo" />
        </div>

        {/* Play Icon Trigger */}
        <a
          href={content.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Mở xem video gốc trong tab mới"
          className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-vrb-red/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-vrb-red transition-all">
            <Play className="w-5 h-5 ml-0.5 fill-white" />
          </div>
        </a>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Missing account alert if flagged */}
          {content.isMissingAccountNotice && (
            <div className="mb-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
              <span><SiteText id="FeaturedVideoCard.1" /></span>
            </div>
          )}

          <h3 className="text-base font-bold text-slate-900 group-hover:text-vrb-blue transition-colors mb-2 line-clamp-2">
            {content.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {content.excerpt}
          </p>

          <div className="space-y-1 text-xs text-slate-500 border-t border-slate-100 pt-2.5 mb-3">
            <div className="flex min-w-0 items-start gap-1.5">
              <User className="w-3.5 h-3.5 text-vrb-blue" />
              <span className="font-medium text-slate-700">{content.authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span className="break-words leading-relaxed">{content.branch}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/noi-dung-noi-bat/${content.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-vrb-blue transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /><SiteText id="FeaturedVideoCard.2" /></Link>

          <a
            href={content.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-vrb-blue hover:bg-vrb-blue-dark text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <span><SiteText id="FeaturedVideoCard.3" /></span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
