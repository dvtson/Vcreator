import { SiteText } from '../../components/common/SiteText';
import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Gift, Calendar, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AwardItem } from '../../types';

export const AwardsPage: React.FC = () => {
  const { awards, programInfo } = useData();

  const mondayAwards = awards.filter((a) => a.group === 'monday');
  const biweeklyAwards = awards.filter((a) => a.group === 'biweekly');
  const grandAwards = awards.filter((a) => a.group === 'grand');

  // Sum calculated values
  const totalDetailedSum = awards.reduce((acc, item) => acc + (item.totalEstimated || 0), 0);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';
  };

  const renderAwardTable = (items: AwardItem[]) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
            <th className="py-3 px-4 font-bold"><SiteText id="AwardsPage.1" /></th>
            <th className="py-3 px-4 font-bold"><SiteText id="AwardsPage.2" /></th>
            <th className="py-3 px-4 font-bold"><SiteText id="AwardsPage.3" /></th>
            <th className="py-3 px-4 font-bold"><SiteText id="AwardsPage.4" /></th>
            <th className="py-3 px-4 font-bold"><SiteText id="AwardsPage.5" /></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3.5 px-4 font-bold text-slate-900">{item.title}</td>
              <td className="py-3.5 px-4 text-slate-600">{item.periodDescription}</td>
              <td className="py-3.5 px-4 font-medium text-slate-800">{item.prizeQuantity}</td>
              <td className="py-3.5 px-4 font-bold text-vrb-red">{item.rewardValue}</td>
              <td className="py-3.5 px-4 text-slate-600 max-w-xs">{item.evaluationCriteria}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-vrb-blue"><SiteText id="AwardsPage.6" /></Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold"><SiteText id="AwardsPage.7" /></span>
        </nav>

        {/* Header Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs mb-4">
            <Trophy className="w-3.5 h-3.5 text-amber-600" /><SiteText id="AwardsPage.8" /></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4"><SiteText id="AwardsPage.9" /></h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6"><SiteText id="AwardsPage.10" /></p>

          {/* Budget Transparency Note */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold"><SiteText id="AwardsPage.11" /></p>
              <p className="text-amber-800 leading-relaxed"><SiteText id="AwardsPage.12" /><strong>{formatVND(programInfo.budgetTotal ?? 102000000)}</strong><SiteText id="AwardsPage.14" /><strong>{formatVND(totalDetailedSum)}</strong><SiteText id="AwardsPage.15" /></p>
            </div>
          </div>
        </div>

        {/* 1. Nhóm Thử thách Thứ Hai */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-vrb-blue">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900"><SiteText id="AwardsPage.16" /></h2>
                <span className="text-xs text-slate-500"><SiteText id="AwardsPage.17" /></span>
              </div>
            </div>
            <span className="text-xs font-bold text-vrb-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200"><SiteText id="AwardsPage.18" /></span>
          </div>
          {renderAwardTable(mondayAwards)}
        </div>

        {/* 2. Nhóm Giải Nửa Tháng */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-vrb-red">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900"><SiteText id="AwardsPage.19" /></h2>
                <span className="text-xs text-slate-500"><SiteText id="AwardsPage.20" /></span>
              </div>
            </div>
            <span className="text-xs font-bold text-vrb-red bg-red-50 px-3 py-1 rounded-full border border-red-200"><SiteText id="AwardsPage.21" /></span>
          </div>
          {renderAwardTable(biweeklyAwards)}
        </div>

        {/* 3. Nhóm Giải Tổng Kết Chung Cuộc */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900"><SiteText id="AwardsPage.22" /></h2>
                <span className="text-xs text-slate-500"><SiteText id="AwardsPage.23" /></span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200"><SiteText id="AwardsPage.24" /></span>
          </div>
          {renderAwardTable(grandAwards)}
        </div>

        {/* Bottom Navigation */}
        <div className="text-center pt-4">
          <Link
            to="/the-le"
            className="text-xs font-bold text-vrb-blue hover:text-vrb-blue-dark inline-flex items-center gap-1"
          ><SiteText id="AwardsPage.25" /></Link>
        </div>
      </div>
    </div>
  );
};
