import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MessageCircle, 
  Camera, 
  CalendarDays, 
  ShoppingCart,
  Sparkles,
  ChevronRight,
  Crown,
  Zap,
  Bot,
  ChefHat
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { supabase } from "@/integrations/supabase/client";
import mascotImage from "@/assets/chefly-mascot.png";

const texts = {
  es: {
    title: "Chef IA",
    subtitle: "Tu asistente de nutrición inteligente",
    quickTip: "Tip del día",
    tips: [
      "Escanea tu comida para obtener información nutricional instantánea 📸",
      "Pregúntame sobre recetas saludables o consejos de nutrición 💬",
      "Genera un plan semanal personalizado según tus objetivos 🎯",
      "Tu lista de compras se genera automáticamente del plan 🛒",
    ],
    chat: {
      title: "Chat con Chefly",
      description: "Consejero nutricional personal 24/7",
    },
    scanner: {
      title: "Escáner de Alimentos",
      description: "Analiza cualquier comida con IA",
    },
    recipes: {
      title: "Mis Recetas",
      description: "Recetas personalizadas para ti",
    },
    mealPlan: {
      title: "Plan Semanal",
      description: "Tu plan de comidas de la semana",
    },
    shopping: {
      title: "Lista de Compras",
      description: "Ingredientes de tu plan semanal",
    },
    premium: "Plus",
    free: "Gratis",
    messagesLeft: "mensajes hoy",
    scansLeft: "escaneos hoy",
    unlimited: "ilimitado",
  },
  en: {
    title: "Chef AI",
    subtitle: "Your intelligent nutrition assistant",
    quickTip: "Tip of the day",
    tips: [
      "Scan your food to get instant nutritional info 📸",
      "Ask me about healthy recipes or nutrition advice 💬",
      "Generate a personalized weekly plan for your goals 🎯",
      "Your shopping list is auto-generated from the plan 🛒",
    ],
    chat: {
      title: "Chat with Chefly",
      description: "24/7 personal nutrition advisor",
    },
    scanner: {
      title: "Food Scanner",
      description: "Analyze any food with AI",
    },
    recipes: {
      title: "My Recipes",
      description: "Personalized recipes for you",
    },
    mealPlan: {
      title: "Weekly Plan",
      description: "Your weekly meal plan",
    },
    shopping: {
      title: "Shopping List",
      description: "Ingredients from your weekly plan",
    },
    premium: "Plus",
    free: "Free",
    messagesLeft: "messages today",
    scansLeft: "scans today",
    unlimited: "unlimited",
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
  usageInfo?: string;
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
  gradient,
  usageInfo
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Card
        className="relative overflow-hidden cursor-pointer group border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
        onClick={onClick}
      >
        {/* Gradient background */}
        <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${gradient}`} />
        
        <div className="relative p-4 flex items-center gap-4">
          {/* Icon container */}
          <motion.div 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${gradient}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {icon}
          </motion.div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-foreground">{title}</h3>
              {isPremium && (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-0 text-[10px] px-1.5">
                  <Crown className="h-2.5 w-2.5 mr-0.5" />
                  {premiumLabel}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
            {usageInfo && (
              <p className="text-xs text-primary font-medium mt-1">{usageInfo}</p>
            )}
          </div>
          
          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </Card>
    </motion.div>
  );
}

export default function ChefIA() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string>();
  const [tipIndex, setTipIndex] = useState(0);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
    // Random tip on load
    setTipIndex(Math.floor(Math.random() * 4));
  }, []);
  
  const { subscribed } = useSubscription(userId);
  const { limits } = useSubscriptionLimits(userId);
  const t = texts[language];

  const chatUsage = subscribed 
    ? t.unlimited 
    : `${Math.max(0, 5 - limits.chatMessagesUsed)}/${5} ${t.messagesLeft}`;
  
  const scanUsage = subscribed
    ? t.unlimited
    : `${Math.max(0, 1 - limits.foodScansUsed)}/${1} ${t.scansLeft}`;

  const features = [
    {
      icon: <MessageCircle className="h-7 w-7 text-white" />,
      title: t.chat.title,
      description: t.chat.description,
      isPremium: false,
      onClick: () => navigate("/chat"),
      gradient: "bg-gradient-to-br from-pink-500 to-rose-600",
      usageInfo: chatUsage,
    },
    {
      icon: <Camera className="h-7 w-7 text-white" />,
      title: t.scanner.title,
      description: t.scanner.description,
      isPremium: true,
      onClick: () => navigate("/dashboard/ai-camera/snack"),
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      usageInfo: scanUsage,
    },
    {
      icon: <ChefHat className="h-7 w-7 text-white" />,
      title: t.recipes.title,
      description: t.recipes.description,
      isPremium: true,
      onClick: () => navigate("/recipes"),
      gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
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
    <div className="min-h-full bg-background pb-24">
      {/* Header with mascot */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent pb-6">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <Sparkles className="w-full h-full text-primary" />
        </div>
        
        <div className="px-4 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <img
                src={mascotImage}
                alt="Chefly"
                className="w-16 h-16 object-contain"
              />
              <motion.div
                className="absolute -top-1 -right-1 bg-primary rounded-full p-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bot className="h-3 w-3 text-primary-foreground" />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
              <p className="text-muted-foreground text-sm">{t.subtitle}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tip of the day */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4 -mt-2 mb-4"
      >
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="p-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary mb-0.5">{t.quickTip}</p>
              <p className="text-sm text-muted-foreground">{t.tips[tipIndex]}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Feature cards */}
      <div className="px-4 space-y-3">
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
            delay={0.1 + index * 0.08}
            gradient={feature.gradient}
            usageInfo={feature.usageInfo}
          />
        ))}
      </div>
    </div>
  );
}
