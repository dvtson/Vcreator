import { challengeTimeStatus } from '../../services/dates';
import { SiteText, useSiteText } from '../common/SiteText';
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { Challenge, TimeStatus } from '../../types';
import { Badge } from '../common/Badge';

interface ChallengeCardProps {
  challenge: Challenge;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const text = useSiteText();
  // Determine time status based on current date (Vietnam time)
  const getTimeStatus = challengeTimeStatus;

  const timeStatus = getTimeStatus(challenge.date);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-vrb-blue/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={challenge.bannerUrl}
          alt={challenge.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="time" timeStatus={timeStatus} />
          {challenge.isFeaturedHome && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white shadow-sm"><SiteText id="ChallengeCard.1" /></span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2.5">
            <Calendar className="w-3.5 h-3.5 text-vrb-blue" />
            <span><SiteText id="ChallengeCard.2" />{formatDate(challenge.date)}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-vrb-blue transition-colors mb-2.5 line-clamp-2">
            {challenge.title}
          </h3>

          <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {challenge.excerpt}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <span className="text-xs font-semibold text-vrb-red">
            {challenge.prizeStructure?.split('|')[0] || text("ChallengeCard.extra1")}
          </span>
          <Link
            to={`/thu-thach/${challenge.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-vrb-blue group-hover:text-vrb-blue-dark transition-colors"
          ><SiteText id="ChallengeCard.3" /><ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
