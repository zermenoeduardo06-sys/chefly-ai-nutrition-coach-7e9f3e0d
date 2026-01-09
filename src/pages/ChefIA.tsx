import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MessageCircle, 
  Camera, 
  CalendarDays, 
  ShoppingCart,
  Sparkles,
  ChevronRight,
  Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import mascotImage from "@/assets/chefly-mascot.png";

const texts = {
  es: {
    title: "Chef IA",
    subtitle: "Tu asistente de nutrición inteligente",
    chat: {
      title: "Chat con Chefly",
      description: "Consejero nutricional personal 24/7",
    },
    scanner: {
      title: "Escáner de Alimentos",
      description: "Analiza cualquier comida con IA",
    },
    mealPlan: {
      title: "Plan Semanal",
      description: "Recetas personalizadas para tu objetivo",
    },
    shopping: {
      title: "Lista de Compras",
      description: "Ingredientes de tu plan semanal",
    },
    premium: "Plus",
    free: "Gratis",
  },
  en: {
    title: "Chef AI",
    subtitle: "Your intelligent nutrition assistant",
    chat: {
      title: "Chat with Chefly",
      description: "24/7 personal nutrition advisor",
    },
    scanner: {
      title: "Food Scanner",
      description: "Analyze any food with AI",
    },
    mealPlan: {
      title: "Weekly Plan",
      description: "Personalized recipes for your goal",
    },
    shopping: {
      title: "Shopping List",
      description: "Ingredients from your weekly plan",
    },
    premium: "Plus",
    free: "Free",
  },
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isPremium?: boolean;
  premiumLabel: string;
  freeLabel: string;
  onClick: () => void;
  delay?: number;
  gradient: string;
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  isPremium = false,
  premiumLabel,
  freeLabel,
  onClick,
  delay = 0,
  gradient
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Card
        className="relative overflow-hidden cursor-pointer group border-border/50 hover:border-primary/30 transition-all duration-300"
        onClick={onClick}
      >
        {/* Gradient background */}
        <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${gradient}`} />
        
        <div className="relative p-4 flex items-center gap-4">
          {/* Icon container */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${gradient}`}>
            {icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{title}</h3>
              {isPremium && (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-0 text-[10px] px-1.5">
                  <Crown className="h-2.5 w-2.5 mr-0.5" />
                  {premiumLabel}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
          </div>
          
          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Card>
    </motion.div>
  );
}

export default function ChefIA() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string>();
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);
  
  const { subscribed } = useSubscription(userId);
  const t = texts[language];

  const features = [
    {
      icon: <MessageCircle className="h-7 w-7 text-white" />,
      title: t.chat.title,
      description: t.chat.description,
      isPremium: false,
      onClick: () => navigate("/chat"),
      gradient: "bg-gradient-to-br from-pink-500 to-rose-600",
    },
    {
      icon: <Camera className="h-7 w-7 text-white" />,
      title: t.scanner.title,
      description: t.scanner.description,
      isPremium: true,
      onClick: () => navigate("/dashboard/ai-camera/snack"),
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    {
      icon: <CalendarDays className="h-7 w-7 text-white" />,
      title: t.mealPlan.title,
      description: t.mealPlan.description,
      isPremium: true,
      onClick: () => navigate("/dashboard"),
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      icon: <ShoppingCart className="h-7 w-7 text-white" />,
      title: t.shopping.title,
      description: t.shopping.description,
      isPremium: true,
      onClick: () => navigate("/dashboard/shopping"),
      gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
    },
  ];

  return (
    <div className="min-h-full bg-background">
      {/* Header with mascot */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent pb-8">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <Sparkles className="w-full h-full text-primary" />
        </div>
        
        <div className="px-4 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <motion.img
              src={mascotImage}
              alt="Chefly"
              className="w-16 h-16 object-contain"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
              <p className="text-muted-foreground text-sm">{t.subtitle}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="px-4 -mt-2 space-y-3 pb-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            isPremium={feature.isPremium}
            premiumLabel={t.premium}
            freeLabel={t.free}
            onClick={feature.onClick}
            delay={index * 0.1}
            gradient={feature.gradient}
          />
        ))}
      </div>
    </div>
  );
}
