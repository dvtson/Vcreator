import { SiteText, useSiteText } from '../../components/common/SiteText';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  ArrowRight,
  Send,
  BookOpen,
  Award,
  Video,
  Users,
  Trophy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ChallengeCard } from '../../components/cards/ChallengeCard';
import { FeaturedVideoCard } from '../../components/cards/FeaturedVideoCard';
import { IndividualCard } from '../../components/cards/IndividualCard';

export const HomePage: React.FC = () => {
  const text = useSiteText();
  const { programInfo, challenges, featuredContents, featuredIndividuals, awards } = useData();

  // Find featured challenge (pinned or first upcoming/ongoing)
  const featuredChallenge = challenges.find((c) => c.isFeaturedHome) || challenges[0];

  // Top 3 challenges for "Explore our challenges" section (following template wireframe)
  const threeChallenges = challenges.slice(0, 3);

  // Top videos (limit 3 sample videos)
  const displayVideos = featuredContents.slice(0, 3);

  // Top 5 individuals (max 5, display only existing items, no empty cards)
  const displayIndividuals = featuredIndividuals.slice(0, 5);

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* 1. HERO SECTION (Designed following the minimalist template wireframe) */}
      <section style={programInfo.bannerUrl ? {backgroundImage: `linear-gradient(90deg, rgba(248,250,252,.98), rgba(248,250,252,.85)), url("${programInfo.bannerUrl}")`,backgroundSize: 'cover',backgroundPosition: 'center'} : undefined} className="relative overflow-hidden pt-10 sm:pt-14 lg:pt-20 pb-12 sm:pb-16 bg-radial from-blue-50/70 via-slate-50 to-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-vrb-red text-xs font-bold mb-6 shadow-2xs">
              <Sparkles className="w-4 h-4 text-vrb-red" />
              <span>{programInfo.subTitle}</span>
            </div>

            {/* Main Headline according to template wireframe */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">{programInfo.title}<span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-vrb-blue mt-2">
                {programInfo.slogan || text("HomePage.extra1")}
              </span>
            </h1>

            {/* Campaign Timeline */}
            <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-relaxed font-semibold text-slate-700 bg-white/90 border border-slate-200/90 rounded-xl px-4 py-2 mb-6 shadow-xs">
              <Calendar className="w-4 h-4 text-vrb-red" />
              <span><SiteText id="HomePage.3" /></span>
              <span className="text-vrb-blue font-bold whitespace-nowrap">
                {programInfo.startDate?.split('-').reverse().join('/')} – {programInfo.endDate?.split('-').reverse().join('/')}
              </span>
            </div>

            {/* Brief Introduction */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
              {programInfo.heroDescription}
            </p>

            {/* Primary Action Buttons (According to template & requirements) */}
            <div className="hero-actions grid grid-cols-1 min-[380px]:grid-cols-2 sm:flex sm:flex-wrap items-stretch gap-3">
              <Link
                to="/thu-thach"
                className="px-6 py-3.5 rounded-xl bg-vrb-blue hover:bg-vrb-blue-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:-translate-y-0.5"
              >
                <span><SiteText id="HomePage.4" /></span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/the-le"
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span><SiteText id="HomePage.5" /></span>
              </Link>

              <Link
                to="/huong-dan"
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs transition-colors"
              ><SiteText id="HomePage.6" /></Link>

              {programInfo.isSubmissionActive && (
                <a
                  href="/gui-bai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  <span><SiteText id="HomePage.7" /></span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Decorative background shape suggestive of VRB curves */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full max-w-lg pointer-events-none opacity-10 lg:opacity-15 hidden md:block">
          <div className="w-full h-full bg-gradient-to-l from-vrb-red via-vrb-blue to-transparent rounded-l-full blur-3xl" />
        </div>
      </section>

      {/* 2. THỬ THÁCH NỔI BẬT ĐƯỢC GHIM */}
      {featuredChallenge && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-vrb-blue-deep to-vrb-blue rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-amber-300 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5" /><SiteText id="HomePage.8" /></div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {featuredChallenge.title}
                </h2>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {featuredChallenge.excerpt}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-200">
                  <span><SiteText id="HomePage.9" />{featuredChallenge.date.split('-').reverse().join('/')}</span>
                  <span>🏆 {featuredChallenge.prizeStructure?.split('|')[0]}</span>
                </div>
                <div className="pt-4 flex flex-wrap gap-3">
                  <Link
                    to={`/thu-thach/${featuredChallenge.slug}`}
                    className="px-5 py-2.5 rounded-xl bg-white text-vrb-blue-deep hover:bg-slate-100 font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
                  ><SiteText id="HomePage.10" /><ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {programInfo.isSubmissionActive && (
                    <a
                      href="/gui-bai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /><SiteText id="HomePage.11" /></a>
                  )}
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/40">
                  <img
                    src={featuredChallenge.bannerUrl}
                    alt={featuredChallenge.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. SECTION 3-COLUMN CARDS (Following the "Explore our services" wireframe) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3"><SiteText id="HomePage.12" /></h2>
          <p className="text-sm text-slate-600"><SiteText id="HomePage.13" /></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {threeChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/thu-thach"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all hover:scale-102"
          >
            <span><SiteText id="HomePage.14" /></span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. SECTION GALLERY / VIDEOS (Following the "Take a look at our work" wireframe) */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-vrb-red uppercase tracking-wider mb-2">
                <Video className="w-4 h-4" /><SiteText id="HomePage.15" /></div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"><SiteText id="HomePage.16" /></h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1"><SiteText id="HomePage.17" /></p>
            </div>
            <Link
              to="/noi-dung-noi-bat"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-vrb-blue hover:text-vrb-blue-dark transition-colors"
            ><SiteText id="HomePage.18" /><ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {displayVideos.map((video) => (
              <FeaturedVideoCard key={video.id} content={video} />
            ))}
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500 max-w-xl mx-auto"><SiteText id="HomePage.19" /><strong><SiteText id="HomePage.20" /></strong><SiteText id="HomePage.21" /></div>
        </div>
      </section>

      {/* 5. TOP 5 CÁ NHÂN NỔI BẬT (VINH DANH CHỌN LỌC) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4" /><SiteText id="HomePage.22" /></div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3"><SiteText id="HomePage.23" /></h2>
          <p className="text-sm text-slate-600"><SiteText id="HomePage.24" /></p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayIndividuals.map((ind, idx) => (
            <IndividualCard key={ind.id} individual={ind} rank={idx + 1} />
          ))}
        </div>
      </section>

      {/* 6. TÓM TẮT CƠ CẤU GIẢI THƯỞNG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-vrb-blue-deep rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2"><SiteText id="HomePage.25" /></span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3"><SiteText id="HomePage.26" /></h2>
            <p className="text-slate-300 text-sm leading-relaxed"><SiteText id="HomePage.27" /><strong>{new Intl.NumberFormat('vi-VN').format(programInfo.budgetTotal ?? 102000000)} VNĐ</strong><SiteText id="HomePage.29" /></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-amber-300 mb-2"><SiteText id="HomePage.30" /></h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4"><SiteText id="HomePage.31" /></p>
              <div className="text-lg font-extrabold text-white"><SiteText id="HomePage.32" /></div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-amber-300 mb-2"><SiteText id="HomePage.33" /></h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4"><SiteText id="HomePage.34" /></p>
              <div className="text-lg font-extrabold text-white"><SiteText id="HomePage.35" /></div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-amber-300 mb-2"><SiteText id="HomePage.36" /></h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4"><SiteText id="HomePage.37" /></p>
              <div className="text-lg font-extrabold text-white"><SiteText id="HomePage.38" /></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
            <span className="text-xs text-slate-400"><SiteText id="HomePage.39" /></span>
            <Link
              to="/giai-thuong"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs transition-colors shadow-md"
            >
              <span><SiteText id="HomePage.40" /></span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
