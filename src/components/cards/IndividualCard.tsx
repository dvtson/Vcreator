import { SiteText } from '../common/SiteText';
import React from 'react';
import { Award, ExternalLink, Quote, Building } from 'lucide-react';
import { FeaturedIndividual } from '../../types';
import { Badge } from '../common/Badge';

interface IndividualCardProps {
  individual: FeaturedIndividual;
  rank?: number;
}

export const IndividualCard: React.FC<IndividualCardProps> = ({ individual, rank }) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-vrb-blue/40 shadow-xs hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden">
      {/* Top Banner Rank */}
      <div className="flex flex-wrap items-center justify-end gap-2 mb-5">
        <Badge variant="demo" />
        <span className="w-7 h-7 rounded-full bg-vrb-red/10 text-vrb-red font-bold text-xs flex items-center justify-center border border-vrb-red/20 shadow-xs">
          #{rank || individual.order}
        </span>
      </div>

      <div>
        {/* Avatar and basic info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-vrb-blue/20 shadow-md group-hover:border-vrb-blue transition-colors flex-shrink-0">
            <img loading="lazy" decoding="async"
              src={individual.avatarUrl}
              alt={individual.fullName}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-base font-bold text-slate-900 group-hover:text-vrb-blue transition-colors">
              {individual.fullName}
            </h4>
            <p className="text-xs font-semibold text-vrb-red">{individual.roleTitle}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 leading-relaxed">
              <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="break-words">{individual.branch}</span>
            </p>
          </div>
        </div>

        {/* Achievement Summary */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-vrb-blue"><SiteText id="IndividualCard.1" /></span>
          {individual.achievementSummary}
        </div>

        {/* Quote */}
        {individual.quote && (
          <div className="relative pl-5 text-xs italic text-slate-500 leading-relaxed mb-4">
            <Quote className="w-3.5 h-3.5 text-slate-300 absolute left-0 top-0.5" />
            "{individual.quote}"
          </div>
        )}
      </div>

      {/* Footer link if present */}
      {individual.externalLink && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <a
            href={individual.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-vrb-blue hover:text-vrb-blue-dark transition-colors"
          ><SiteText id="IndividualCard.2" /><ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
