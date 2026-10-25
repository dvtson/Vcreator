import { SiteText, useSiteText } from '../../components/common/SiteText';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Award, AlertCircle, Building2, User } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const CollectiveLeaderboardPage: React.FC = () => {
  const text = useSiteText();
  const { leaderboards } = useData();

  const collectivePeriods = leaderboards.filter((l) => l.type === 'collective');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    collectivePeriods[0]?.id || ''
  );

  const activePeriod = collectivePeriods.find((p) => p.id === selectedPeriodId) || collectivePeriods[0];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-vrb-blue"><SiteText id="CollectiveLeaderboardPage.1" /></Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold"><SiteText id="CollectiveLeaderboardPage.2" /></span>
        </nav>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-vrb-red font-bold text-xs">
              <Building2 className="w-3.5 h-3.5" /><SiteText id="CollectiveLeaderboardPage.3" /></div>

            {/* Switch to Personal */}
            <Link
              to="/xep-hang/ca-nhan"
              className="text-xs font-semibold text-slate-600 hover:text-vrb-blue underline"
            ><SiteText id="CollectiveLeaderboardPage.4" /></Link>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3"><SiteText id="CollectiveLeaderboardPage.5" /></h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6"><SiteText id="CollectiveLeaderboardPage.6" /></p>

          {/* Period selector & Status */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap"><SiteText id="CollectiveLeaderboardPage.7" /></span>
              <select
                value={activePeriod?.id || ''}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 outline-none focus:border-vrb-blue cursor-pointer"
              >
                {collectivePeriods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.periodName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {activePeriod?.statusLabel === 'chinh_thuc' ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200"><SiteText id="CollectiveLeaderboardPage.8" /></span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200"><SiteText id="CollectiveLeaderboardPage.9" /></span>
              )}
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /><SiteText id="CollectiveLeaderboardPage.10" />{activePeriod?.updatedAt || '30/11/2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Demo Disclaimer Box */}
        <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold"><SiteText id="CollectiveLeaderboardPage.11" /></p>
            <p className="text-amber-800 leading-relaxed">
              {activePeriod?.evaluationNote ||
                text("CollectiveLeaderboardPage.extra1")}
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="py-3.5 px-4 text-center w-16"><SiteText id="CollectiveLeaderboardPage.12" /></th>
                  <th className="py-3.5 px-4"><SiteText id="CollectiveLeaderboardPage.13" /></th>
                  <th className="py-3.5 px-4 text-right"><SiteText id="CollectiveLeaderboardPage.14" /></th>
                  <th className="py-3.5 px-4"><SiteText id="CollectiveLeaderboardPage.15" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activePeriod?.entries && activePeriod.entries.length > 0 ? (
                  activePeriod.entries.map((entry, idx) => {
                    const isTop1 = entry.rank === 1;
                    const isTop2 = entry.rank === 2;
                    const isTop3 = entry.rank === 3;

                    return (
                      <tr
                        key={entry.id || idx}
                        className={`hover:bg-red-50/30 transition-colors ${
                          isTop1 ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <td className="py-4 px-4 text-center font-bold">
                          {isTop1 ? (
                            <span className="w-7 h-7 mx-auto rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-extrabold shadow-xs"><SiteText id="CollectiveLeaderboardPage.16" /></span>
                          ) : isTop2 ? (
                            <span className="w-7 h-7 mx-auto rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold"><SiteText id="CollectiveLeaderboardPage.17" /></span>
                          ) : isTop3 ? (
                            <span className="w-7 h-7 mx-auto rounded-full bg-amber-600/30 text-amber-900 flex items-center justify-center font-bold"><SiteText id="CollectiveLeaderboardPage.18" /></span>
                          ) : (
                            <span className="text-slate-500 font-semibold">{entry.rank}</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <Building2 className="w-4 h-4 text-vrb-blue" />
                            <span className="font-bold text-slate-900 text-sm">{entry.name}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right font-extrabold text-vrb-red text-sm">
                          {entry.score.toLocaleString('vi-VN')}<SiteText id="CollectiveLeaderboardPage.19" /></td>

                        <td className="py-4 px-4">
                          {entry.awardWon ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Trophy className="w-3.5 h-3.5 text-amber-600" />
                              {entry.awardWon}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic"><SiteText id="CollectiveLeaderboardPage.20" /></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
