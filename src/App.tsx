import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MascotProvider } from "@/contexts/MascotContext";
import { Capacitor } from "@capacitor/core";
import CookieConsent from "@/components/CookieConsent";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import SplashScreen from "@/components/SplashScreen";
import FloatingMascot from "@/components/FloatingMascot";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(() => Capacitor.isNativePlatform());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <LanguageProvider>
          <MascotProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AnimatePresence mode="wait">
                {showSplash && (
                  <SplashScreen onComplete={() => setShowSplash(false)} />
                )}
              </AnimatePresence>
              <BrowserRouter>
                {!Capacitor.isNativePlatform() && <CookieConsent />}
                <AnimatedRoutes />
                <FloatingMascot />
              </BrowserRouter>
            </TooltipProvider>
          </MascotProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
