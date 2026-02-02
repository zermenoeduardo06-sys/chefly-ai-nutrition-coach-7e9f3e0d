import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Sparkles, Volume2, VolumeX, Crown, MessageSquare, Brain, Zap, Target, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { AiUsageIndicator } from "@/components/AiUsageIndicator";
import { Badge } from "@/components/ui/badge";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "@/hooks/useHaptics";
import { useChatSounds } from "@/hooks/useChatSounds";
import { useAuth } from "@/contexts/AuthContext";

import mascotLime from "@/assets/mascot-lime.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const TypingIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-end gap-3"
  >
    <motion.div 
      animate={{ 
        y: [0, -8, 0],
        rotate: [-5, 5, -5]
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="w-12 h-12 flex-shrink-0"
    >
      <img src={mascotLime} alt="Chefly thinking" className="w-full h-full object-contain" />
    </motion.div>
    <Card className="bg-card border-2 border-primary/20 p-3 rounded-2xl rounded-bl-sm">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary"
            animate={{ 
              y: [0, -6, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </Card>
  </motion.div>
);

const CheflyAvatar = ({ isAnimating = false }: { isAnimating?: boolean }) => (
  <motion.div 
    className="w-10 h-10 flex-shrink-0"
    animate={isAnimating ? { 
      scale: [1, 1.1, 1],
      rotate: [-3, 3, -3]
    } : {}}
    transition={{ duration: 0.5 }}
  >
    <img src={mascotLime} alt="Chefly" className="w-full h-full object-contain drop-shadow-md" />
  </motion.div>
);

const MessageBubble = ({ message, isNew = false }: { message: Message; isNew?: boolean }) => {
  const isUser = message.role === "user";
  
  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <CheflyAvatar />}
      
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`max-w-[80%] ${isUser ? "order-1" : ""}`}
      >
        <Card
          className={`p-3 md:p-4 rounded-2xl shadow-sm ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border-2 border-primary/10 rounded-bl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
            {message.content}
          </p>
        </Card>
      </motion.div>
      
      {isUser && (
        <motion.div 
          className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center flex-shrink-0 shadow-sm"
          whileHover={{ scale: 1.1 }}
        >
          <span className="text-white text-sm font-bold">Tú</span>
        </motion.div>
      )}
    </motion.div>
  );
};

const WelcomeScreen = ({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) => {
  const { t, language } = useLanguage();
  
  const suggestions = language === 'es' ? [
    { text: "¿Puedo cambiar la cena del martes?", emoji: "🍽️" },
    { text: "Dame ideas de snacks saludables", emoji: "🥗" },
    { text: "¿Qué puedo comer si no tengo horno?", emoji: "🔥" },
    { text: "¿Cuánta proteína debo comer?", emoji: "💪" },
  ] : [
    { text: "Can I change Tuesday's dinner?", emoji: "🍽️" },
    { text: "Give me healthy snack ideas", emoji: "🥗" },
    { text: "What can I eat without an oven?", emoji: "🔥" },
    { text: "How much protein should I eat?", emoji: "💪" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-8 px-4"
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative mb-4"
      >
        <motion.img 
          src={mascotLime}
          alt="Chefly"
          className="w-32 h-32 object-contain drop-shadow-lg"
          animate={{ 
            rotate: [-2, 2, -2],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ 
            scale: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            delay: 0.5
          }}
        >
          <Sparkles className="w-6 h-6 text-amber-400" />
        </motion.div>
        <motion.div
          className="absolute -bottom-1 -left-3"
          animate={{ 
            scale: [0, 1, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            delay: 1
          }}
        >
          <Sparkles className="w-5 h-5 text-primary" />
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        className="relative bg-card border-2 border-primary/20 rounded-3xl p-5 mb-6 max-w-sm shadow-lg"
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-card border-l-2 border-t-2 border-primary/20 rotate-45" />
        
        <h3 className="text-xl font-bold text-center mb-2 text-foreground">
          {language === 'es' ? '¡Hola! Soy Chefly 👋' : 'Hi! I\'m Chefly 👋'}
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          {t("chat.welcomeMessage")}
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="flex items-center gap-3 p-3 bg-card border-2 border-border hover:border-primary/30 rounded-xl text-left transition-colors group"
          >
            <span className="text-2xl">{suggestion.emoji}</span>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              "{suggestion.text}"
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// Paywall for free users
const ChatPaywall = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const benefits = language === 'es' ? [
    { icon: MessageSquare, title: "Chat con Coach IA", desc: "$2 USD/mes en créditos incluidos" },
    { icon: Brain, title: "Respuestas personalizadas", desc: "IA adaptada a tus metas" },
    { icon: Zap, title: "Consejos instantáneos", desc: "Respuestas en segundos" },
    { icon: Target, title: "Seguimiento nutricional", desc: "Ayuda con tu dieta diaria" },
  ] : [
    { icon: MessageSquare, title: "AI Coach Chat", desc: "$2 USD/month in credits included" },
    { icon: Brain, title: "Personalized responses", desc: "AI adapted to your goals" },
    { icon: Zap, title: "Instant tips", desc: "Answers in seconds" },
    { icon: Target, title: "Nutrition tracking", desc: "Help with your daily diet" },
  ];

  const floatingEmojis = ["💬", "🧠", "✨", "🎯", "💪", "🥗"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background flex flex-col relative overflow-hidden">
      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-40 pointer-events-none"
          style={{
            left: `${10 + (i * 15)}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [-15, 15, -15],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Header */}
      <header className="p-4 flex items-center gap-3 relative z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Chef IA</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 relative z-10">
        {/* Mascot with glow */}
        <motion.div
          className="relative mb-6"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-150" />
          <motion.img
            src={mascotLime}
            alt="Chefly"
            className="w-36 h-36 object-contain relative z-10 drop-shadow-2xl"
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -top-2 -right-2 z-20"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-amber-400" />
          </motion.div>
        </motion.div>

        {/* Chat mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm mb-6"
        >
          <Card className="p-4 bg-card/80 backdrop-blur border-2 border-primary/20 rounded-2xl">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <img src={mascotLime} alt="" className="w-6 h-6" />
                </div>
                <div className="bg-muted rounded-xl rounded-tl-sm p-3 text-sm max-w-[200px]">
                  {language === 'es' 
                    ? "¡Hola! ¿Cómo puedo ayudarte hoy?" 
                    : "Hi! How can I help you today?"}
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-xl rounded-tr-sm p-3 text-sm max-w-[200px]">
                  {language === 'es'
                    ? "¿Qué snacks saludables recomiendas?"
                    : "What healthy snacks do you recommend?"}
                </div>
              </div>
              <motion.div 
                className="flex items-start gap-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <img src={mascotLime} alt="" className="w-6 h-6" />
                </div>
                <div className="bg-muted rounded-xl rounded-tl-sm p-3 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Premium badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 mb-4"
        >
          <Crown className="h-5 w-5 text-amber-500" />
          <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            {language === 'es' ? 'Función Premium' : 'Premium Feature'}
          </span>
        </motion.div>

        <p className="text-center text-muted-foreground mb-6 max-w-xs">
          {language === 'es'
            ? "Desbloquea conversaciones ilimitadas con tu coach nutricional personalizado"
            : "Unlock unlimited conversations with your personalized nutrition coach"}
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-2 p-3 bg-card/60 rounded-xl border border-border/50"
            >
              <benefit.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">{benefit.title}</p>
                <p className="text-xs text-muted-foreground">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-sm space-y-3"
        >
          <Button
            onClick={() => navigate("/premium-paywall")}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
          >
            <Crown className="mr-2 h-5 w-5" />
            {language === 'es' ? 'Obtener Chefly Plus' : 'Get Chefly Plus'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="w-full"
          >
            {language === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default function ChefIA() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [newMessageId, setNewMessageId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('chefly-sounds');
    return saved !== 'false';
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { limits, refreshLimits } = useSubscriptionLimits(userId);
  const subscription = useSubscription(userId);
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();
  const { t, language } = useLanguage();
  
  const { lightImpact, successNotification, errorNotification } = useHaptics();
  const { playMessageSent, playMessageReceived, playError } = useChatSounds();

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('chefly-sounds', String(newValue));
    if (newValue) {
      playMessageReceived();
      lightImpact();
    }
  };

  // Use AuthContext for immediate user access
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth();

  // Set userId from auth context immediately
  useEffect(() => {
    if (authUser?.id) {
      setUserId(authUser.id);
      loadMessages(authUser.id);
    }
  }, [authUser?.id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (authUser?.id) {
      setInitialLoading(false);
    }
  }, [authLoading, isAuthenticated, authUser?.id, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    localStorage.setItem('chefly_chat_used', 'true');
    await loadMessages(user.id);
  };

  const loadMessages = async (uid: string) => {
    try {
      localStorage.setItem('chefly_chat_used', 'true');
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(data as Message[]);
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    if ((limits?.chatMessagesUsed ?? 0) >= (limits?.dailyChatLimit ?? 999)) {
      toast({
        variant: "destructive",
        title: language === 'es' ? "Límite de mensajes alcanzado" : "Message limit reached",
        description: language === 'es' 
          ? `Has usado tus ${limits?.dailyChatLimit ?? 5} mensajes de hoy. Mejora a Chefly Plus para mensajes ilimitados.`
          : `You've used your ${limits?.dailyChatLimit ?? 5} messages today. Upgrade to Chefly Plus for unlimited messages.`,
      });
      navigate("/pricing");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    if (soundEnabled) playMessageSent();
    lightImpact();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const tempUserId = `temp-${Date.now()}`;
      const tempUserMessage: Message = {
        id: tempUserId,
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);
      setNewMessageId(tempUserId);

      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "user",
        content: userMessage,
      });

      const { data, error } = await supabase.functions.invoke("nutrition-chat", {
        body: { message: userMessage, userId: user.id },
      });

      if (error) throw error;

      // Check for budget limit error
      if (data?.code === 'BUDGET_LIMIT') {
        if (soundEnabled) playError();
        errorNotification();
        toast({
          variant: "destructive",
          title: language === "es" ? "Límite de IA alcanzado" : "AI Limit Reached",
          description: language === "es" 
            ? "Has alcanzado tu límite mensual de uso de IA. El límite se reinicia el 1 de cada mes."
            : "You've reached your monthly AI usage limit. The limit resets on the 1st of each month.",
        });
        // Remove the temp user message since we couldn't process it
        setMessages((prev) => prev.filter(m => m.id !== tempUserId));
        return;
      }

      const aiMessageId = `ai-${Date.now()}`;
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setNewMessageId(aiMessageId);

      if (soundEnabled) playMessageReceived();
      successNotification();

      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: data.response,
      });

      refreshLimits();
    } catch (error: any) {
      if (soundEnabled) playError();
      errorNotification();
      
      // Check if error contains budget limit info
      const errorMessage = error?.message || '';
      const isBudgetError = errorMessage.includes('BUDGET_LIMIT') || errorMessage.includes('límite mensual');
      
      toast({
        variant: "destructive",
        title: isBudgetError 
          ? (language === "es" ? "Límite de IA alcanzado" : "AI Limit Reached")
          : "Error",
        description: isBudgetError
          ? (language === "es" 
              ? "Has alcanzado tu límite mensual de uso de IA. El límite se reinicia el 1 de cada mes."
              : "You've reached your monthly AI usage limit. The limit resets on the 1st of each month.")
          : (error.message || (language === "es" ? "No se pudo enviar el mensaje" : "Could not send message")),
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNewMessageId(null), 500);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    if (soundEnabled) playMessageSent();
    lightImpact();
  };

  // Show loading state while checking auth and subscription
  if (initialLoading || trialLoading || subscription?.isLoading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 bg-background">
        <motion.img 
          src={mascotLime}
          alt="Loading"
          className="w-20 h-20 object-contain"
          animate={{ 
            rotate: [-10, 10, -10],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  // Show paywall for non-premium users (with safe access)
  if (!subscription?.isCheflyPlus) {
    return <ChatPaywall />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = '48px';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = '48px';
    }
  };

  const handleSendWithReset = async (e?: React.FormEvent) => {
    await handleSend(e);
    resetTextareaHeight();
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border/50 bg-card/80 backdrop-blur-xl flex-shrink-0 z-40"
      >
        <div className="container mx-auto px-4 tablet:px-6 py-3 tablet:py-4 flex items-center gap-3 max-w-3xl">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-11 h-11 tablet:w-14 tablet:h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-1 shadow-sm">
                <img 
                  src={mascotLime}
                  alt="Chefly"
                  className="w-full h-full object-contain"
                />
              </div>
              <motion.div 
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card shadow-sm"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg tablet:text-xl font-bold truncate text-foreground">Chefly</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground font-medium">
                  {language === 'es' ? 'Tu coach nutricional' : 'Your nutrition coach'}
                </span>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSound}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            title={soundEnabled ? (language === 'es' ? 'Silenciar' : 'Mute') : (language === 'es' ? 'Activar sonido' : 'Unmute')}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-primary" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
          </motion.button>
          
          {limits?.isCheflyPlus && (
            <AiUsageIndicator userId={userId} compact />
          )}
          
          {limits?.isFreePlan && (
            <Badge variant="outline" className="flex-shrink-0 text-xs border-primary/30">
              {limits?.chatMessagesUsed ?? 0}/{limits?.dailyChatLimit ?? 5}
            </Badge>
          )}
        </div>
      </motion.header>

      {/* Messages area - Scrollable */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 tablet:px-6 py-4 tablet:py-6 space-y-4 max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    isNew={message.id === newMessageId}
                  />
                ))}
                
                {loading && <TypingIndicator />}
              </>
            )}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input area - Always visible at bottom */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-shrink-0 border-t border-border/50 bg-card/90 backdrop-blur-xl"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        <form 
          onSubmit={handleSendWithReset} 
          className="flex items-end gap-3 px-4 tablet:px-6 py-3 max-w-3xl mx-auto"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t("chat.placeholder")}
              disabled={loading}
              rows={1}
              className="w-full resize-none rounded-2xl border-2 border-border bg-background px-4 py-3 text-[15px] placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                minHeight: '48px', 
                maxHeight: '120px',
                height: '48px'
              }}
            />
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              type="submit" 
              disabled={loading || !input.trim()} 
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
