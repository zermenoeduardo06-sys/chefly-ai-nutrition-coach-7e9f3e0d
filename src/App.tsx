import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import Achievements from "./pages/Achievements";
import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Pricing from "./pages/Pricing";
import Subscription from "./pages/Subscription";
import Welcome from "./pages/Welcome";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import NotFound from "./pages/NotFound";
import AffiliatesDashboard from "./pages/AffiliatesDashboard";
import AffiliatesRegister from "./pages/AffiliatesRegister";
import AffiliatesLanding from "./pages/AffiliatesLanding";
import AffiliatesLogin from "./pages/AffiliatesLogin";
import AffiliateTest from "./pages/AffiliateTest";
import AdminAffiliatesDashboard from "./pages/AdminAffiliatesDashboard";
import ShoppingList from "./pages/ShoppingList";
import Settings from "./pages/Settings";
import ProfileEdit from "./pages/ProfileEdit";

const queryClient = new QueryClient();

import { MobileBottomNav } from "@/components/MobileBottomNav";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop header - only show sidebar trigger */}
        <header className="hidden md:flex h-14 border-b bg-card/95 backdrop-blur-lg sticky top-0 z-40 items-center px-4">
          <SidebarTrigger />
        </header>
        {/* Main content with bottom padding for mobile nav */}
        <main className="flex-1 pb-mobile-nav md:pb-0 scroll-touch">{children}</main>
      </div>
    </div>
    {/* Mobile bottom navigation */}
    <MobileBottomNav />
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CookieConsent />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/dashboard/progress" element={<DashboardLayout><Progress /></DashboardLayout>} />
            <Route path="/dashboard/achievements" element={<DashboardLayout><Achievements /></DashboardLayout>} />
            <Route path="/dashboard/challenges" element={<DashboardLayout><Challenges /></DashboardLayout>} />
            <Route path="/dashboard/leaderboard" element={<DashboardLayout><Leaderboard /></DashboardLayout>} />
            <Route path="/dashboard/friends" element={<DashboardLayout><Friends /></DashboardLayout>} />
            <Route path="/dashboard/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
            <Route path="/dashboard/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="/dashboard/settings/profile" element={<DashboardLayout><ProfileEdit /></DashboardLayout>} />
            <Route path="/dashboard/shopping" element={<DashboardLayout><ShoppingList /></DashboardLayout>} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/subscription" element={<DashboardLayout><Subscription /></DashboardLayout>} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:articleId" element={<BlogArticle />} />
            <Route path="/affiliates" element={<AffiliatesDashboard />} />
            <Route path="/affiliates/login" element={<AffiliatesLogin />} />
            <Route path="/affiliates/register" element={<AffiliatesRegister />} />
            <Route path="/affiliates/test" element={<AffiliateTest />} />
            <Route path="/programa-afiliados" element={<AffiliatesLanding />} />
            <Route path="/admin/affiliates" element={<DashboardLayout><AdminAffiliatesDashboard /></DashboardLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
