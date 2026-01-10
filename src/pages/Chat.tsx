import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, ArrowLeft, Sparkles, Volume2, VolumeX, Crown, MessageSquare, Brain, Zap, Target, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Badge } from "@/components/ui/badge";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "@/hooks/useHaptics";
import { useChatSounds } from "@/hooks/useChatSounds";
import { useSubscription } from "@/hooks/useSubscription";

// Import new lime mascots
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
      {/* Animated Chefly mascot */}
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
        
        {/* Sparkle effects */}
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
      
      {/* Speech bubble */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        className="relative bg-card border-2 border-primary/20 rounded-3xl p-5 mb-6 max-w-sm shadow-lg"
      >
        {/* Bubble tail */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-card border-l-2 border-t-2 border-primary/20 rotate-45" />
        
        <h3 className="text-xl font-bold text-center mb-2 text-foreground">
          {language === 'es' ? '¡Hola! Soy Chefly 👋' : 'Hi! I\'m Chefly 👋'}
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          {t("chat.welcomeMessage")}
        </p>
      </motion.div>
      
      {/* Suggestion chips */}
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

// Premium Paywall for Chat
const ChatPaywall = ({ onUpgrade, onBack }: { onUpgrade: () => void; onBack: () => void }) => {
  const { language } = useLanguage();
  
  const texts = {
    es: {
      title: "Chat con Coach IA",
      subtitle: "Tu nutriólogo personal disponible 24/7",
      cta: "Desbloquear con Chefly Plus",
      benefitTitle: "Con el Coach IA puedes:",
      benefit1: "Consultas ilimitadas",
      benefit1Desc: "Pregunta todo sobre nutrición sin límites",
      benefit2: "Consejos personalizados",
      benefit2Desc: "Basados en tu perfil y objetivos",
      benefit3: "Respuestas instantáneas",
      benefit3Desc: "IA avanzada que entiende tus necesidades",
      benefit4: "Ajusta tu plan semanal",
      benefit4Desc: "Modifica comidas según tus preferencias",
    },
    en: {
      title: "AI Coach Chat",
      subtitle: "Your personal nutritionist available 24/7",
      cta: "Unlock with Chefly Plus",
      benefitTitle: "With AI Coach you can:",
      benefit1: "Unlimited consultations",
      benefit1Desc: "Ask anything about nutrition without limits",
      benefit2: "Personalized advice",
      benefit2Desc: "Based on your profile and goals",
      benefit3: "Instant responses",
      benefit3Desc: "Advanced AI that understands your needs",
      benefit4: "Adjust your weekly plan",
      benefit4Desc: "Modify meals according to your preferences",
    },
  };

  const t = texts[language];

  const benefits = [
    { icon: MessageSquare, text: t.benefit1, desc: t.benefit1Desc, color: "from-primary/20 to-primary/5" },
    { icon: Target, text: t.benefit2, desc: t.benefit2Desc, color: "from-secondary/20 to-secondary/5" },
    { icon: Zap, text: t.benefit3, desc: t.benefit3Desc, color: "from-orange-500/20 to-orange-500/5" },
    { icon: Brain, text: t.benefit4, desc: t.benefit4Desc, color: "from-purple-500/20 to-purple-500/5" },
  ];

  const floatingEmojis = [
    { emoji: "💬", top: "10%", left: "8%", delay: 0 },
    { emoji: "🥗", top: "5%", right: "12%", delay: 0.2 },
    { emoji: "💪", top: "18%", left: "85%", delay: 0.4 },
    { emoji: "🎯", bottom: "35%", left: "5%", delay: 0.6 },
    { emoji: "✨", bottom: "40%", right: "8%", delay: 0.3 },
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top">
        <div className="flex items-center p-4">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-8">
        <div className="flex flex-col items-center px-5 relative">
          {/* Floating Emojis */}
          {floatingEmojis.map((item, index) => (
            <motion.div
              key={index}
              className="absolute text-2xl pointer-events-none z-0"
              style={{ 
                top: item.top, 
                left: item.left, 
                right: item.right,
                bottom: item.bottom 
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0.4, 0.7, 0.4], 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                opacity: { delay: item.delay, duration: 3, repeat: Infinity },
                y: { delay: item.delay, duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { delay: item.delay, duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {item.emoji}
            </motion.div>
          ))}

          {/* Chat Mockup */}
          <motion.div
            className="relative mb-6 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-orange-500/30 to-secondary/30 rounded-[3rem] blur-2xl"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.7, 0.5] 
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative w-56 h-64 bg-gradient-to-br from-card to-muted rounded-3xl border-4 border-border shadow-2xl overflow-hidden p-3">
              {/* Chat messages mockup */}
              <div className="space-y-2">
                <motion.div 
                  className="flex items-end gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <img src={mascotLime} alt="Chefly" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="bg-muted rounded-xl rounded-bl-sm p-2 max-w-[140px]">
                    <p className="text-[10px] text-muted-foreground">
                      {language === 'es' ? '¡Hola! ¿En qué puedo ayudarte hoy?' : 'Hi! How can I help you today?'}
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex justify-end"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="bg-primary text-primary-foreground rounded-xl rounded-br-sm p-2 max-w-[140px]">
                    <p className="text-[10px]">
                      {language === 'es' ? '¿Qué snack saludable me recomiendas?' : 'What healthy snack do you recommend?'}
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-end gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <img src={mascotLime} alt="Chefly" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="bg-muted rounded-xl rounded-bl-sm p-2 max-w-[140px]">
                    <motion.div 
                      className="flex gap-1"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Input mockup */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-2 bg-background rounded-full px-3 py-2 border border-border">
                  <div className="flex-1 h-2 bg-muted rounded" />
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Send className="w-3 h-3 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mascot */}
            <motion.img
              src={mascotLime}
              alt="Chefly mascot"
              className="absolute -bottom-6 -right-10 h-28 w-28 object-contain z-20"
              initial={{ x: 30, opacity: 0, rotate: 10 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            />
          </motion.div>

          {/* Title and Subtitle */}
          <motion.div
            className="text-center mb-5 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">{t.title}</h1>
            <p className="text-sm text-muted-foreground max-w-xs">{t.subtitle}</p>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            className="w-full max-w-sm z-10 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
              {t.benefitTitle}
            </p>
            
            <div className="space-y-2.5">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                  className={`flex items-center gap-3 bg-gradient-to-r ${benefit.color} rounded-2xl p-3.5 border border-border/50`}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-xl bg-background/80 flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.1 }}
                  >
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-foreground">{benefit.text}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="w-full max-w-sm z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              onClick={onUpgrade}
              size="lg"
              className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary via-orange-500 to-primary hover:opacity-90 rounded-2xl shadow-xl relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <Crown className="h-5 w-5 mr-2" />
              {t.cta}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
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
  const { limits, refreshLimits } = useSubscriptionLimits(userId);
  const subscription = useSubscription(userId);
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();
  const { t, language } = useLanguage();
  
  // Check if user is premium
  const isPremium = subscription.isCheflyPlus;
  const isFullyLoaded = !subscription.isLoading && userId;
  
  // Haptics and sounds
  const { lightImpact, mediumImpact, successNotification, errorNotification } = useHaptics();
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

  useEffect(() => {
    checkAuth();
  }, []);

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
    // Mark that the user has used the chat for new user checklist
    localStorage.setItem('chefly_chat_used', 'true');
    await loadMessages(user.id);
  };

  const loadMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(data as Message[]);
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    // Check chat limit
    if (limits.chatMessagesUsed >= limits.dailyChatLimit) {
      toast({
        variant: "destructive",
        title: language === 'es' ? "Límite de mensajes alcanzado" : "Message limit reached",
        description: language === 'es' 
          ? `Has usado tus ${limits.dailyChatLimit} mensajes de hoy. Mejora a Chefly Plus para mensajes ilimitados.`
          : `You've used your ${limits.dailyChatLimit} messages today. Upgrade to Chefly Plus for unlimited messages.`,
      });
      navigate("/pricing");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Play send sound and haptic
    if (soundEnabled) playMessageSent();
    lightImpact();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const tempUserId = `temp-${Date.now()}`;
      // Add user message to UI immediately
      const tempUserMessage: Message = {
        id: tempUserId,
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);
      setNewMessageId(tempUserId);

      // Save user message to database
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "user",
        content: userMessage,
      });

      // Get AI response
      const { data, error } = await supabase.functions.invoke("nutrition-chat", {
        body: { message: userMessage, userId: user.id },
      });

      if (error) throw error;

      const aiMessageId = `ai-${Date.now()}`;
      // Add AI response to messages
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setNewMessageId(aiMessageId);

      // Play receive sound and haptic
      if (soundEnabled) playMessageReceived();
      successNotification();

      // Save AI response to database
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: data.response,
      });

      // Refresh limits after sending
      refreshLimits();
    } catch (error: any) {
      // Play error sound and haptic
      if (soundEnabled) playError();
      errorNotification();
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || (language === "es" ? "No se pudo enviar el mensaje" : "Could not send message"),
      });
    } finally {
      setLoading(false);
      // Clear new message indicator after animation
      setTimeout(() => setNewMessageId(null), 500);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    if (soundEnabled) playMessageSent();
    lightImpact();
  };

  if (initialLoading || trialLoading || subscription.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
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

  // Show paywall for non-premium users
  if (!isPremium) {
    return (
      <ChatPaywall 
        onUpgrade={() => navigate('/premium-paywall')} 
        onBack={() => navigate('/dashboard')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col">
      {/* Header with safe area */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-40 pt-safe-top"
      >
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className="touch-target flex-shrink-0 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-1 shadow-sm">
                <img 
                  src={mascotLime}
                  alt="Chefly"
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Online indicator - subtle dot */}
              <motion.div 
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card shadow-sm"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold truncate text-foreground">Chefly</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground font-medium">
                  {language === 'es' ? 'Tu coach nutricional' : 'Your nutrition coach'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Sound toggle */}
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
          
          {limits.isFreePlan && (
            <Badge variant="outline" className="flex-shrink-0 text-xs border-primary/30">
              {limits.chatMessagesUsed}/{limits.dailyChatLimit}
            </Badge>
          )}
        </div>
      </motion.header>

      {/* Messages area */}
      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-2xl overflow-hidden">
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-4 pb-4">
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
                  
                  {/* Typing indicator */}
                  {loading && <TypingIndicator />}
                </>
              )}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={handleSend} 
          className="mt-3 flex gap-2 bg-background/80 backdrop-blur-sm pt-2 pb-safe-area-bottom"
        >
          <motion.div 
            className="flex-1 relative"
            whileFocus={{ scale: 1.01 }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.placeholder")}
              disabled={loading}
              className="flex-1 h-12 text-base rounded-full border-2 border-border focus:border-primary/50 pl-4 pr-4 bg-card"
              enterKeyHint="send"
            />
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              type="submit" 
              disabled={loading || !input.trim()} 
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default Chat;
