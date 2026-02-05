import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Check, Crown, Sparkles, Camera, MessageCircle, Users, RefreshCcw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { IAPPaywall } from "@/components/IAPPaywall";
import mascotCelebrating from "@/assets/mascot-celebrating.png";

export default function PostRegisterPaywall() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>();
  const [iapPaywallOpen, setIapPaywallOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // If no user, redirect to auth
        navigate('/auth', { replace: true });
      }
    };
    loadUser();
  }, [navigate]);

  const texts = {
    es: {
      welcome: "¡Bienvenido a Chefly!",
      subtitle: "Desbloquea todo el potencial de tu nutrición",
      freeTitle: "Gratis",
      plusTitle: "Chefly Plus",
      price: "$7.99/mes",
      subscribeBtn: "Comenzar con Plus",
      skipBtn: "Continuar gratis",
      comparison: [
        { feature: "Planes semanales", free: "1 plan", plus: "Ilimitados ✨", icon: Calendar },
        { feature: "Escaneo IA", free: "❌", plus: "Ilimitado 📸", icon: Camera },
        { feature: "Chat Chef IA", free: "❌", plus: "$2 USD/mes 💬", icon: MessageCircle },
        { feature: "Intercambio comidas", free: "❌", plus: "✅", icon: RefreshCcw },
        { feature: "Sistema de amigos", free: "❌", plus: "✅", icon: Users },
      ],
    },
    en: {
      welcome: "Welcome to Chefly!",
      subtitle: "Unlock your full nutrition potential",
      freeTitle: "Free",
      plusTitle: "Chefly Plus",
      price: "$7.99/month",
      subscribeBtn: "Start with Plus",
      skipBtn: "Continue for free",
      comparison: [
        { feature: "Weekly plans", free: "1 plan", plus: "Unlimited ✨", icon: Calendar },
        { feature: "AI Scanning", free: "❌", plus: "Unlimited 📸", icon: Camera },
        { feature: "Chef AI Chat", free: "❌", plus: "$2 USD/month 💬", icon: MessageCircle },
        { feature: "Meal swapping", free: "❌", plus: "✅", icon: RefreshCcw },
        { feature: "Friends system", free: "❌", plus: "✅", icon: Users },
      ],
    },
  };

  const t = texts[language];

  const handleSubscribe = () => {
    setIapPaywallOpen(true);
  };

  const handleClose = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleSkip = () => {
    navigate('/dashboard', { replace: true });
  };

  // Floating food emojis positions
  const floatingEmojis = [
    { emoji: "🍎", top: "8%", left: "8%", delay: 0 },
    { emoji: "🥕", top: "12%", right: "10%", delay: 0.5 },
    { emoji: "✨", top: "18%", left: "15%", delay: 1 },
    { emoji: "🥦", top: "15%", right: "18%", delay: 0.3 },
  ];

  return (
    <div 
      className="min-h-screen bg-background flex flex-col relative overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
        style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <X className="h-6 w-6 text-muted-foreground" />
      </motion.button>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-12 pb-32">
        {/* Floating Emojis */}
        {floatingEmojis.map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-2xl pointer-events-none"
            style={{ top: item.top, left: item.left, right: item.right }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: [0, -8, 0],
            }}
            transition={{ 
              opacity: { delay: item.delay, duration: 0.5 },
              y: { delay: item.delay, duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Mascot */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="relative mb-4"
          >
            <img
              src={mascotCelebrating}
              alt="Chefly mascot"
              className="h-28 w-28 object-contain"
            />
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-foreground mb-1"
          >
            {t.welcome}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            {t.subtitle}
          </motion.p>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-muted/50 py-3 px-4 border-b border-border">
            <div className="text-xs font-medium text-muted-foreground">
              {/* Empty for feature column */}
            </div>
            <div className="text-center">
              <span className="text-xs font-semibold text-muted-foreground">{t.freeTitle}</span>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                <Crown className="h-3 w-3" />
                {t.plusTitle}
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {t.comparison.map((row, index) => {
            const IconComponent = row.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.08 }}
                className={`grid grid-cols-3 py-3.5 px-4 items-center ${
                  index !== t.comparison.length - 1 ? 'border-b border-border/50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <IconComponent className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{row.feature}</span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-muted-foreground">{row.free}</span>
                </div>
                <div className="text-center">
                  <span className="text-xs font-medium text-foreground">{row.plus}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Price Tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-4"
        >
          <span className="text-lg font-bold text-foreground">{t.price}</span>
        </motion.div>
      </div>

      {/* Fixed Bottom CTA */}
      <div 
        className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-background/95 backdrop-blur-sm border-t border-border space-y-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            onClick={handleSubscribe}
            size="lg"
            className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
          >
            <Crown className="mr-2 h-5 w-5" />
            {t.subscribeBtn}
          </Button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={handleSkip}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t.skipBtn}
        </motion.button>

        {/* Legal Links */}
        <div className="text-center text-xs text-muted-foreground">
          <Link to="/terms" className="underline">{language === 'es' ? 'Términos de Uso' : 'Terms of Use'}</Link>
          {" · "}
          <Link to="/privacy" className="underline">{language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}</Link>
        </div>
      </div>

      {/* iOS IAP Paywall */}
      <IAPPaywall
        open={iapPaywallOpen}
        onOpenChange={setIapPaywallOpen}
        userId={userId}
      />
    </div>
  );
}
