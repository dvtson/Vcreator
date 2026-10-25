const AdminAccountsPage = lazy(() => import('./pages/admin/AdminAccountsPage').then(module => ({ default: module.AdminAccountsPage })));
const SubmissionPage = lazy(() => import('./pages/public/SubmissionPage').then(module => ({ default: module.SubmissionPage })));
const AdminSubmissionsPage = lazy(() => import('./pages/admin/AdminSubmissionsPage').then(module => ({ default: module.AdminSubmissionsPage })));
const AdminSiteTextPage = lazy(() => import('./pages/admin/AdminSiteTextPage').then(module => ({ default: module.AdminSiteTextPage })));
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ScrollToTop } from './components/common/ScrollToTop';

// Layouts
import { UserLayout } from './components/layout/UserLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
const HomePage = lazy(() => import('./pages/public/HomePage').then(module => ({ default: module.HomePage })));
const AboutPage = lazy(() => import('./pages/public/AboutPage').then(module => ({ default: module.AboutPage })));
const ChallengesPage = lazy(() => import('./pages/public/ChallengesPage').then(module => ({ default: module.ChallengesPage })));
const ChallengeDetailPage = lazy(() => import('./pages/public/ChallengeDetailPage').then(module => ({ default: module.ChallengeDetailPage })));
const RulesPage = lazy(() => import('./pages/public/RulesPage').then(module => ({ default: module.RulesPage })));
const TermsPage = lazy(() => import('./pages/public/TermsPage').then(module => ({ default: module.TermsPage })));
const GuidePage = lazy(() => import('./pages/public/GuidePage').then(module => ({ default: module.GuidePage })));
const AwardsPage = lazy(() => import('./pages/public/AwardsPage').then(module => ({ default: module.AwardsPage })));
const FeaturedContentPage = lazy(() => import('./pages/public/FeaturedContentPage').then(module => ({ default: module.FeaturedContentPage })));
const ContentDetailPage = lazy(() => import('./pages/public/ContentDetailPage').then(module => ({ default: module.ContentDetailPage })));
const PersonalLeaderboardPage = lazy(() => import('./pages/public/PersonalLeaderboardPage').then(module => ({ default: module.PersonalLeaderboardPage })));
const CollectiveLeaderboardPage = lazy(() => import('./pages/public/CollectiveLeaderboardPage').then(module => ({ default: module.CollectiveLeaderboardPage })));
const CommunityPage = lazy(() => import('./pages/public/CommunityPage').then(module => ({ default: module.CommunityPage })));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

// Admin Pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(module => ({ default: module.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));
const AdminProgramInfoPage = lazy(() => import('./pages/admin/AdminProgramInfoPage').then(module => ({ default: module.AdminProgramInfoPage })));
const AdminChallengesPage = lazy(() => import('./pages/admin/AdminChallengesPage').then(module => ({ default: module.AdminChallengesPage })));
const AdminChallengeEditPage = lazy(() => import('./pages/admin/AdminChallengeEditPage').then(module => ({ default: module.AdminChallengeEditPage })));
const AdminPagesEditorPage = lazy(() => import('./pages/admin/AdminPagesEditorPage').then(module => ({ default: module.AdminPagesEditorPage })));
const AdminFaqsPage = lazy(() => import('./pages/admin/AdminFaqsPage').then(module => ({ default: module.AdminFaqsPage })));
const AdminAwardsPage = lazy(() => import('./pages/admin/AdminAwardsPage').then(module => ({ default: module.AdminAwardsPage })));
const AdminIndividualsPage = lazy(() => import('./pages/admin/AdminIndividualsPage').then(module => ({ default: module.AdminIndividualsPage })));
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage').then(module => ({ default: module.AdminContentPage })));
const AdminLeaderboardsPage = lazy(() => import('./pages/admin/AdminLeaderboardsPage').then(module => ({ default: module.AdminLeaderboardsPage })));
const AdminBackupPage = lazy(() => import('./pages/admin/AdminBackupPage').then(module => ({ default: module.AdminBackupPage })));

export const App: React.FC = () => {
  return (
    <DataProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<div className="p-12 text-center" role="status">Đang tải trang…</div>}>
        <Routes>
          {/* Public Portal Routes */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/chuong-trinh" element={<AboutPage />} />
            <Route path="/thu-thach" element={<ChallengesPage />} />
            <Route path="/thu-thach/:slug" element={<ChallengeDetailPage />} />
            <Route path="/the-le" element={<RulesPage />} />
            <Route path="/dieu-khoan" element={<TermsPage />} />
            <Route path="/huong-dan" element={<GuidePage />} />
            <Route path="/giai-thuong" element={<AwardsPage />} />
            <Route path="/noi-dung-noi-bat" element={<FeaturedContentPage />} />
            <Route path="/noi-dung-noi-bat/:id" element={<ContentDetailPage />} />
            <Route path="/xep-hang/ca-nhan" element={<PersonalLeaderboardPage />} />
            <Route path="/xep-hang/tap-the" element={<CollectiveLeaderboardPage />} />
            <Route path="/gui-bai" element={<SubmissionPage />} />
            <Route path="/cong-dong" element={<CommunityPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Authentication Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="info" element={<AdminProgramInfoPage />} />
            <Route path="challenges" element={<AdminChallengesPage />} />
            <Route path="challenges/new" element={<AdminChallengeEditPage />} />
            <Route path="challenges/:id" element={<AdminChallengeEditPage />} />
            <Route path="pages" element={<AdminPagesEditorPage />} />
            <Route path="faqs" element={<AdminFaqsPage />} />
            <Route path="awards" element={<AdminAwardsPage />} />
            <Route path="top-individuals" element={<AdminIndividualsPage />} />
            <Route path="content" element={<AdminContentPage />} />
            <Route path="leaderboards" element={<AdminLeaderboardsPage />} />
            <Route path="site-text" element={<AdminSiteTextPage />} />
            <Route path="submissions" element={<AdminSubmissionsPage />} />
            <Route path="accounts" element={<AdminAccountsPage />} />
            <Route path="backup" element={<AdminBackupPage />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </DataProvider>
  );
};

export default App;
