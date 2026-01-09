import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { PageTransition } from '@/components/PageTransition';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Onboarding from '@/pages/Onboarding';
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
import AffiliatesRegister from '@/pages/AffiliatesRegister';
import AffiliatesLanding from '@/pages/AffiliatesLanding';
import AffiliatesLogin from '@/pages/AffiliatesLogin';
import AffiliateTest from '@/pages/AffiliateTest';
import AdminAffiliatesDashboard from '@/pages/AdminAffiliatesDashboard';
import ShoppingList from '@/pages/ShoppingList';
import Settings from '@/pages/Settings';
import ProfileEdit from '@/pages/ProfileEdit';
import AvatarEdit from '@/pages/AvatarEdit';
import Preferences from '@/pages/Preferences';
import NotificationSettings from '@/pages/NotificationSettings';
import FoodHistory from '@/pages/FoodHistory';
import FoodSearch from '@/pages/FoodSearch';
import FamilyManagement from '@/pages/FamilyManagement';
import Contact from '@/pages/Contact';
import AppStoreDemo from '@/pages/AppStoreDemo';
import PreOnboarding from '@/pages/PreOnboarding';
import MealDetail from '@/pages/MealDetail';
import AddFood from '@/pages/AddFood';
import AICamera from '@/pages/AICamera';
import ChefIA from '@/pages/ChefIA';
import MorePage from '@/pages/MorePage';
import Recipes from '@/pages/Recipes';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        <header className="hidden md:flex h-14 border-b bg-card sticky top-0 z-40 items-center px-4 flex-shrink-0">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-mobile-nav md:pb-0 scroll-touch bg-background">{children}</main>
      </div>
    </div>
    <MobileBottomNav />
  </SidebarProvider>
);

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public pages */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/start" element={<PageTransition><PreOnboarding /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/welcome-onboarding" element={<PageTransition><OnboardingWelcome /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/welcome" element={<PageTransition><Welcome /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:articleId" element={<PageTransition><BlogArticle /></PageTransition>} />
        <Route path="/programa-afiliados" element={<PageTransition><AffiliatesLanding /></PageTransition>} />
        <Route path="/app-store-demo" element={<AppStoreDemo />} />
        
        {/* Dashboard pages */}
        <Route path="/dashboard" element={<DashboardLayout><PageTransition><Dashboard /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/progress" element={<DashboardLayout><PageTransition><Progress /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/more" element={<DashboardLayout><PageTransition><MorePage /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/achievements" element={<DashboardLayout><PageTransition><Achievements /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/challenges" element={<DashboardLayout><PageTransition><Challenges /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/leaderboard" element={<DashboardLayout><PageTransition><Leaderboard /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/friends" element={<DashboardLayout><PageTransition><Friends /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/profile" element={<DashboardLayout><PageTransition><Profile /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/settings" element={<DashboardLayout><PageTransition><Settings /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/settings/profile" element={<DashboardLayout><PageTransition><ProfileEdit /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/settings/avatar" element={<DashboardLayout><PageTransition><AvatarEdit /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/avatar" element={<DashboardLayout><PageTransition><AvatarEdit /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/settings/preferences" element={<DashboardLayout><PageTransition><Preferences /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/settings/notifications" element={<DashboardLayout><PageTransition><NotificationSettings /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/settings/contact" element={<DashboardLayout><PageTransition><Contact /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/shopping" element={<DashboardLayout><PageTransition><ShoppingList /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/food-history" element={<DashboardLayout><PageTransition><FoodHistory /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/food-search" element={<DashboardLayout><PageTransition><FoodSearch /></PageTransition></DashboardLayout>} />
        <Route path="/dashboard/meal/:mealType" element={<PageTransition><MealDetail /></PageTransition>} />
        <Route path="/dashboard/add-food/:mealType" element={<PageTransition><AddFood /></PageTransition>} />
        <Route path="/dashboard/ai-camera/:mealType" element={<PageTransition><AICamera /></PageTransition>} />
        <Route path="/subscription" element={<DashboardLayout><PageTransition><Subscription /></PageTransition></DashboardLayout>} />
        <Route path="/family" element={<DashboardLayout><PageTransition><FamilyManagement /></PageTransition></DashboardLayout>} />
        <Route path="/admin/affiliates" element={<DashboardLayout><PageTransition><AdminAffiliatesDashboard /></PageTransition></DashboardLayout>} />
        
        {/* Chef IA Hub */}
        <Route path="/chef-ia" element={<DashboardLayout><PageTransition><ChefIA /></PageTransition></DashboardLayout>} />
        <Route path="/recipes" element={<DashboardLayout><PageTransition><Recipes /></PageTransition></DashboardLayout>} />
        
        {/* Chat */}
        <Route path="/chat" element={<PageTransition><Chat /></PageTransition>} />
        
        {/* Affiliates */}
        <Route path="/affiliates" element={<PageTransition><AffiliatesDashboard /></PageTransition>} />
        <Route path="/affiliates/login" element={<PageTransition><AffiliatesLogin /></PageTransition>} />
        <Route path="/affiliates/register" element={<PageTransition><AffiliatesRegister /></PageTransition>} />
        <Route path="/affiliates/test" element={<PageTransition><AffiliateTest /></PageTransition>} />
        
        {/* 404 */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};
