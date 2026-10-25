import { SiteText } from '../../components/common/SiteText';
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Video, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { FeaturedVideoCard } from '../../components/cards/FeaturedVideoCard';

export const FeaturedContentPage: React.FC = () => {
  const { featuredContents } = useData();
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return featuredContents.filter((item) => {
      if (platformFilter !== 'all' && item.platform !== platformFilter) {
        return false;
      }
      if (typeFilter !== 'all' && item.contentType !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [featuredContents, platformFilter, typeFilter]);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-vrb-blue"><SiteText id="FeaturedContentPage.1" /></Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold"><SiteText id="FeaturedContentPage.2" /></span>
        </nav>

        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-vrb-red font-bold text-xs mb-3">
            <Sparkles className="w-3.5 h-3.5" /><SiteText id="FeaturedContentPage.3" /></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3"><SiteText id="FeaturedContentPage.4" /></h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed"><SiteText id="FeaturedContentPage.5" /></p>
        </div>

        {/* Demo Disclaimer Banner */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong><SiteText id="FeaturedContentPage.6" /></strong><SiteText id="FeaturedContentPage.7" /></span>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-vrb-blue" />
            <span><SiteText id="FeaturedContentPage.8" /></span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Filter by Platform */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  platformFilter === 'all' ? 'bg-white text-vrb-blue font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              ><SiteText id="FeaturedContentPage.9" /></button>
              <button
                type="button"
                onClick={() => setPlatformFilter('facebook')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  platformFilter === 'facebook' ? 'bg-white text-vrb-blue font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              ><SiteText id="FeaturedContentPage.10" /></button>
              <button
                type="button"
                onClick={() => setPlatformFilter('tiktok')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  platformFilter === 'tiktok' ? 'bg-white text-vrb-blue font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              ><SiteText id="FeaturedContentPage.11" /></button>
            </div>

            {/* Filter by Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:border-vrb-blue cursor-pointer"
            >
              <option value="all"><SiteText id="FeaturedContentPage.12" /></option>
              <option value="video"><SiteText id="FeaturedContentPage.13" /></option>
              <option value="post"><SiteText id="FeaturedContentPage.14" /></option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <FeaturedVideoCard key={item.id} content={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Video className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1"><SiteText id="FeaturedContentPage.15" /></h3>
            <p className="text-xs text-slate-500 mb-4"><SiteText id="FeaturedContentPage.16" /></p>
            <button
              onClick={() => {
                setPlatformFilter('all');
                setTypeFilter('all');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            ><SiteText id="FeaturedContentPage.17" /></button>
          </div>
        )}
      </div>
    </div>
  );
};
