import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { PageTransition } from '@/components/PageTransition';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import OnboardingWelcome from '@/pages/OnboardingWelcome';
import Dashboard from '@/pages/Dashboard';
import Progress from '@/pages/Progress';
import Achievements from '@/pages/Achievements';
import Challenges from '@/pages/Challenges';
import Leaderboard from '@/pages/Leaderboard';
import Friends from '@/pages/Friends';
import Profile from '@/pages/Profile';
import Chat from '@/pages/Chat';
import Pricing from '@/pages/Pricing';
import Subscription from '@/pages/Subscription';
import Welcome from '@/pages/Welcome';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import FAQ from '@/pages/FAQ';
import Blog from '@/pages/Blog';
import BlogArticle from '@/pages/BlogArticle';
import NotFound from '@/pages/NotFound';
import AffiliatesDashboard from '@/pages/AffiliatesDashboard';
import InfluencerDashboard from '@/pages/InfluencerDashboard';
import AdminAffiliatesDashboard from '@/pages/AdminAffiliatesDashboard';
import ShoppingList from '@/pages/ShoppingList';
import Settings from '@/pages/Settings';
import ProfileEdit from '@/pages/ProfileEdit';
import AvatarEdit from '@/pages/AvatarEdit';
import Preferences from '@/pages/Preferences';
import NotificationSettings from '@/pages/NotificationSettings';
import FoodHistory from '@/pages/FoodHistory';
import FoodSearch from '@/pages/FoodSearch';

import Contact from '@/pages/Contact';
import AppStoreDemo from '@/pages/AppStoreDemo';
import PreOnboarding from '@/pages/PreOnboarding';
import MealDetail from '@/pages/MealDetail';
import AddFood from '@/pages/AddFood';
import AICamera from '@/pages/AICamera';
import ChefIA from '@/pages/ChefIA';
import MorePage from '@/pages/MorePage';
import Recipes from '@/pages/Recipes';
import FoodScannerPage from '@/pages/FoodScannerPage';
import PremiumPaywall from '@/pages/PremiumPaywall';
import WelcomePlusScreen from '@/pages/WelcomePlusScreen';
import Wellness from '@/pages/Wellness';
import PostRegisterPaywall from '@/pages/PostRegisterPaywall';
import CommitmentScreen from '@/components/onboarding/CommitmentScreen';
import { FreeTrialRoulette, TrialWonCelebration, TrialTrustScreen, TrialActivation } from '@/components/trial';
/**
 * Persistent DashboardLayout shell - mounts ONCE and stays mounted
 * across all dashboard/* navigations. Only the <Outlet /> content changes.
 * Resets scroll to top on every route change.
 */
const DashboardLayout = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Reset scroll to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="flex h-[100dvh] w-full bg-background overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        {/* Sidebar only visible on lg+ (desktop) */}
        <div className="hidden lg:block">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
          {/* Header only visible on lg+ (desktop) */}
          <header className="hidden lg:flex h-14 border-b bg-card sticky top-0 z-40 items-center px-4 flex-shrink-0">
            <SidebarTrigger />
          </header>
          <main 
            ref={mainRef}
            className="flex-1 overflow-y-auto overflow-x-hidden pb-mobile-nav lg:pb-0 scroll-touch bg-background"
          >
            <Outlet />
          </main>
        </div>
      </div>
      {/* Bottom nav visible on mobile AND tablet (hidden on lg+) */}
      <MobileBottomNav />
    </SidebarProvider>
  );
};

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes location={location}>
      {/* ============================================ */}
      {/* PUBLIC PAGES - with page transitions        */}
      {/* ============================================ */}
      <Route path="/" element={<PageTransition><Index /></PageTransition>} />
      <Route path="/start" element={<PageTransition><PreOnboarding /></PageTransition>} />
      <Route path="/pre-onboarding" element={<PageTransition><PreOnboarding /></PageTransition>} />
      <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
      <Route path="/welcome-onboarding" element={<PageTransition><OnboardingWelcome /></PageTransition>} />
      <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
      <Route path="/welcome" element={<PageTransition><Welcome /></PageTransition>} />
      <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
      <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
      <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
      <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
      <Route path="/blog/:articleId" element={<PageTransition><BlogArticle /></PageTransition>} />
      <Route path="/app-store-demo" element={<AppStoreDemo />} />
      <Route path="/premium-paywall" element={<PageTransition><PremiumPaywall /></PageTransition>} />
      <Route path="/welcome-plus" element={<PageTransition><WelcomePlusScreen /></PageTransition>} />
      <Route path="/post-register-paywall" element={<PageTransition><PostRegisterPaywall /></PageTransition>} />
      <Route path="/commitment" element={<PageTransition><CommitmentScreen /></PageTransition>} />
      <Route path="/trial-roulette" element={<PageTransition><FreeTrialRoulette /></PageTransition>} />
      <Route path="/trial-won" element={<PageTransition><TrialWonCelebration /></PageTransition>} />
      <Route path="/trial-trust" element={<PageTransition><TrialTrustScreen /></PageTransition>} />
      <Route path="/trial-activate" element={<PageTransition><TrialActivation /></PageTransition>} />
      <Route path="/chat" element={<PageTransition><Chat /></PageTransition>} />
      <Route path="/influencer/:code" element={<PageTransition><InfluencerDashboard /></PageTransition>} />
      {/* ============================================ */}
      {/* DASHBOARD PAGES - persistent shell          */}
      {/* Layout mounts once, only Outlet changes     */}
      {/* ============================================ */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="progress" element={<Progress />} />
        <Route path="more" element={<MorePage />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="friends" element={<Friends />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/profile" element={<ProfileEdit />} />
        <Route path="settings/avatar" element={<AvatarEdit />} />
        <Route path="avatar" element={<AvatarEdit />} />
        <Route path="settings/preferences" element={<Preferences />} />
        <Route path="settings/notifications" element={<NotificationSettings />} />
        <Route path="settings/contact" element={<Contact />} />
        <Route path="shopping" element={<ShoppingList />} />
        <Route path="food-history" element={<FoodHistory />} />
        <Route path="food-search" element={<FoodSearch />} />
        <Route path="scanner" element={<FoodScannerPage />} />
        <Route path="scanner/:mealType" element={<FoodScannerPage />} />
        <Route path="wellness" element={<Wellness />} />
      </Route>

      {/* Dashboard pages that need full-screen (no persistent nav) */}
      <Route path="/dashboard/meal/:mealType" element={<PageTransition><MealDetail /></PageTransition>} />
      <Route path="/dashboard/add-food/:mealType" element={<PageTransition><AddFood /></PageTransition>} />
      <Route path="/dashboard/ai-camera/:mealType" element={<PageTransition><AICamera /></PageTransition>} />

      {/* Subscription page within dashboard shell */}
      <Route path="/subscription" element={<DashboardLayout />}>
        <Route index element={<Subscription />} />
      </Route>

      {/* Admin pages within dashboard shell */}
      <Route path="/admin/affiliates" element={<DashboardLayout />}>
        <Route index element={<AdminAffiliatesDashboard />} />
      </Route>

      {/* Chef IA and Recipes - within dashboard shell */}
      <Route path="/chef-ia" element={<DashboardLayout />}>
        <Route index element={<ChefIA />} />
      </Route>
      <Route path="/recipes" element={<DashboardLayout />}>
        <Route index element={<Recipes />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
    </Routes>
  );
};
