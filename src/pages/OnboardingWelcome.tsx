import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Sparkles, ChefHat, Target, ShoppingCart } from "lucide-react";
import mascotHappy from "@/assets/mascot-happy.png";

const OnboardingWelcome = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: ChefHat,
      titleKey: "onboardingWelcome.feature1.title",
      descKey: "onboardingWelcome.feature1.desc",
    },
    {
      icon: Target,
      titleKey: "onboardingWelcome.feature2.title",
      descKey: "onboardingWelcome.feature2.desc",
    },
    {
      icon: ShoppingCart,
      titleKey: "onboardingWelcome.feature3.title",
      descKey: "onboardingWelcome.feature3.desc",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Animated mascot */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative mx-auto mb-6"
          >
            <motion.img
              src={mascotHappy}
              alt="Chefly Mascot"
              className="w-36 h-36 mx-auto drop-shadow-xl"
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            {/* Waving hand effect */}
            <motion.div
              className="absolute -right-4 top-6 text-3xl"
              animate={{ rotate: [0, 20, 0, 20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            >
              👋
            </motion.div>
          </motion.div>

          {/* Welcome text */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold mb-2"
          >
            {t("onboardingWelcome.greeting")}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-primary font-medium mb-2"
          >
            {t("onboardingWelcome.mascotIntro")}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground mb-8"
          >
            {t("onboardingWelcome.subtitle")}
          </motion.p>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3 mb-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-3 bg-card/50 border border-border/50 rounded-xl p-4 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{t(feature.titleKey)}</h3>
                  <p className="text-xs text-muted-foreground">{t(feature.descKey)}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Button
              onClick={() => navigate("/start")}
              className="w-full h-14 text-lg font-semibold"
              variant="hero"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              {t("onboardingWelcome.cta")}
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              {t("onboardingWelcome.time")}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingWelcome;
