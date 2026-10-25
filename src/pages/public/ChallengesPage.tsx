import { challengeTimeStatus } from '../../services/dates';
import { SiteText } from '../../components/common/SiteText';
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ChallengeCard } from '../../components/cards/ChallengeCard';
import { TimeStatus } from '../../types';

export const ChallengesPage: React.FC = () => {
  const { challenges } = useData();
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TimeStatus | 'all'>('all');

  const getTimeStatus = challengeTimeStatus;

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      // Month filter
      if (selectedMonth !== 'all' && c.month !== selectedMonth) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all') {
        const status = getTimeStatus(c.date);
        if (status !== selectedStatus) return false;
      }
      return true;
    });
  }, [challenges, selectedMonth, selectedStatus]);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-vrb-blue"><SiteText id="ChallengesPage.1" /></Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold"><SiteText id="ChallengesPage.2" /></span>
        </nav>

        {/* Page Header */}
        <div className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-vrb-blue font-bold text-xs mb-3">
            <Sparkles className="w-3.5 h-3.5" /><SiteText id="ChallengesPage.3" /></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3"><SiteText id="ChallengesPage.4" /></h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed"><SiteText id="ChallengesPage.5" /></p>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-vrb-blue" />
            <span><SiteText id="ChallengesPage.6" /></span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter by Month */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedMonth('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedMonth === 'all' ? 'bg-white text-vrb-blue font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              ><SiteText id="ChallengesPage.7" /></button>
              {[...new Set(challenges.map(item=>item.month))].sort((a,b)=>a-b).map(month=><button key={month} type="button" onClick={()=>setSelectedMonth(month)} className={`px-3 py-1.5 rounded-lg transition-all ${selectedMonth===month?'bg-white text-vrb-blue font-bold shadow-xs':'text-slate-600 hover:text-slate-900'}`}><SiteText id="ChallengesPage.monthLabel" /> {month}</button>)}
            </div>

            {/* Filter by Time Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TimeStatus | 'all')}
              className="text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:border-vrb-blue cursor-pointer"
            >
              <option value="all"><SiteText id="ChallengesPage.10" /></option>
              <option value="ongoing"><SiteText id="ChallengesPage.11" /></option>
              <option value="upcoming"><SiteText id="ChallengesPage.12" /></option>
              <option value="ended"><SiteText id="ChallengesPage.13" /></option>
            </select>
          </div>
        </div>

        {/* Challenge Cards Grid */}
        {filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1"><SiteText id="ChallengesPage.14" /></h3>
            <p className="text-xs text-slate-500 mb-4"><SiteText id="ChallengesPage.15" /></p>
            <button
              onClick={() => {
                setSelectedMonth('all');
                setSelectedStatus('all');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            ><SiteText id="ChallengesPage.16" /></button>
          </div>
        )}
      </div>
    </div>
  );
};
