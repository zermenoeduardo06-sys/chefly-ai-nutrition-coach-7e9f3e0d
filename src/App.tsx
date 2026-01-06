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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - datos frescos por más tiempo
      gcTime: 10 * 60 * 1000, // 10 minutos en cache (antes cacheTime)
      retry: 2, // Reintentar 2 veces en caso de error
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
      refetchOnWindowFocus: false, // No refetch al cambiar de pestaña
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

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
