import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, ArrowLeft, Sparkles, Volume2, VolumeX, Crown, MessageSquare, Brain, Zap, Target, Mic } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Badge } from "@/components/ui/badge";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useHaptics } from "@/hooks/useHaptics";
import { useChatSounds } from "@/hooks/useChatSounds";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

// Import mascot
import mascotLime from "@/assets/mascot-lime.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Modern typing indicator with dots
const TypingIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-end gap-3 max-w-[85%]"
  >
    <motion.div 
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0"
    >
      <img src={mascotLime} alt="Chefly" className="w-7 h-7 object-contain" />
    </motion.div>
    <div className="bg-muted/80 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-bl-md">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/60"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// Modern message bubble
const MessageBubble = ({ message, isNew = false }: { message: Message; isNew?: boolean }) => {
  const isUser = message.role === "user";
  
  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 15, scale: 0.97 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn("flex items-end gap-2", isUser ? "flex-row-reverse" : "")}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
          <img src={mascotLime} alt="Chefly" className="w-5 h-5 object-contain" />
        </div>
      )}
      
      {/* Message bubble */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-2xl shadow-sm",
          isUser
            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md"
            : "bg-muted/80 backdrop-blur-sm text-foreground rounded-bl-md"
        )}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </motion.div>
    </motion.div>
  );
};

// Fun welcome screen with quick actions
const WelcomeScreen = ({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) => {
  const { language } = useLanguage();
  
  const suggestions = language === 'es' ? [
    { text: "¿Cuánta proteína necesito al día?", emoji: "💪", color: "from-rose-500/20 to-rose-500/5" },
    { text: "Dame ideas de snacks saludables", emoji: "🥗", color: "from-emerald-500/20 to-emerald-500/5" },
    { text: "¿Puedo cambiar una comida del plan?", emoji: "🍽️", color: "from-amber-500/20 to-amber-500/5" },
    { text: "¿Qué puedo comer si tengo antojo?", emoji: "🍫", color: "from-purple-500/20 to-purple-500/5" },
  ] : [
    { text: "How much protein do I need daily?", emoji: "💪", color: "from-rose-500/20 to-rose-500/5" },
    { text: "Give me healthy snack ideas", emoji: "🥗", color: "from-emerald-500/20 to-emerald-500/5" },
    { text: "Can I swap a meal from my plan?", emoji: "🍽️", color: "from-amber-500/20 to-amber-500/5" },
    { text: "What can I eat if I have cravings?", emoji: "🍫", color: "from-purple-500/20 to-purple-500/5" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-6 px-2"
    >
      {/* Animated mascot */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-6"
      >
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 p-3 shadow-lg">
          <motion.img 
            src={mascotLime}
            alt="Chefly"
            className="w-full h-full object-contain"
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
        
        {/* Sparkles */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
        </motion.div>
      </motion.div>
      
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6"
      >
        <h2 className="text-xl font-bold text-foreground mb-1">
          {language === 'es' ? '¡Hola! Soy Chefly 👋' : 'Hi! I\'m Chefly 👋'}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          {language === 'es' 
            ? 'Tu coach de nutrición personal. Pregúntame lo que quieras.' 
            : 'Your personal nutrition coach. Ask me anything.'}
        </p>
      </motion.div>
      
      {/* Quick suggestions */}
      <div className="w-full max-w-sm space-y-2">
        <p className="text-xs font-medium text-muted-foreground text-center mb-3">
          {language === 'es' ? 'Prueba preguntándome:' : 'Try asking me:'}
        </p>
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all",
              "bg-gradient-to-r border border-border/50 hover:border-primary/30",
              suggestion.color
            )}
          >
            <span className="text-2xl">{suggestion.emoji}</span>
            <span className="text-sm font-medium text-foreground flex-1">{suggestion.text}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// Premium paywall for chat
const ChatPaywall = ({ onUpgrade, onBack }: { onUpgrade: () => void; onBack: () => void }) => {
  const { language } = useLanguage();
  
  const texts = {
    es: {
      title: "Chat con Coach IA",
      subtitle: "Tu nutriólogo personal disponible 24/7",
      cta: "Desbloquear con Chefly Plus",
      benefits: [
        { icon: MessageSquare, text: "Consultas ilimitadas", desc: "Pregunta todo sin límites" },
        { icon: Target, text: "Consejos personalizados", desc: "Basados en tu perfil" },
        { icon: Zap, text: "Respuestas instantáneas", desc: "IA avanzada 24/7" },
        { icon: Brain, text: "Ajusta tu plan", desc: "Modifica tus comidas" },
      ],
    },
    en: {
      title: "AI Coach Chat",
      subtitle: "Your personal nutritionist available 24/7",
      cta: "Unlock with Chefly Plus",
      benefits: [
        { icon: MessageSquare, text: "Unlimited consultations", desc: "Ask anything without limits" },
        { icon: Target, text: "Personalized advice", desc: "Based on your profile" },
        { icon: Zap, text: "Instant responses", desc: "Advanced AI 24/7" },
        { icon: Brain, text: "Adjust your plan", desc: "Modify your meals" },
      ],
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur safe-area-top">
        <div className="flex items-center p-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-8">
        {/* Chat preview mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-8"
        >
          <div className="absolute -inset-6 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-full blur-2xl" />
          
          <div className="relative w-48 h-56 bg-card rounded-3xl border-2 border-border shadow-xl p-3 overflow-hidden">
            {/* Mini chat messages */}
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                  <img src={mascotLime} className="w-4 h-4" />
                </div>
                <div className="bg-muted rounded-xl rounded-bl-sm px-2 py-1.5 max-w-[120px]">
                  <p className="text-[9px] text-muted-foreground">
                    {language === 'es' ? '¡Hola! ¿Cómo puedo ayudarte?' : 'Hi! How can I help?'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-xl rounded-br-sm px-2 py-1.5 max-w-[120px]">
                  <p className="text-[9px]">
                    {language === 'es' ? '¿Qué snack me recomiendas?' : 'What snack do you recommend?'}
                  </p>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                  <img src={mascotLime} className="w-4 h-4" />
                </div>
                <div className="bg-muted rounded-xl rounded-bl-sm px-2 py-1.5">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div 
                        key={i}
                        className="w-1 h-1 rounded-full bg-primary/60"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mascot peeking */}
          <motion.img
            src={mascotLime}
            className="absolute -bottom-4 -right-8 w-20 h-20 object-contain"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold mb-1">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
          {t.benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-muted/50 rounded-2xl p-3 text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                <benefit.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-semibold">{benefit.text}</p>
              <p className="text-xs text-muted-foreground">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm"
        >
          <Button
            onClick={onUpgrade}
            size="lg"
            className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary via-orange-500 to-primary rounded-2xl shadow-lg"
          >
            <Crown className="w-5 h-5 mr-2" />
            {t.cta}
          </Button>
        </motion.div>
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { limits, refreshLimits } = useSubscriptionLimits(userId);
  const subscription = useSubscription(userId);
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();
  const { t, language } = useLanguage();
  
  const isPremium = subscription.isCheflyPlus;
  
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
      if (data) setMessages(data as Message[]);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    if (limits.chatMessagesUsed >= limits.dailyChatLimit) {
      toast({
        variant: "destructive",
        title: language === 'es' ? "Límite alcanzado" : "Limit reached",
        description: language === 'es' 
          ? `Has usado tus ${limits.dailyChatLimit} mensajes. Mejora a Plus.`
          : `You've used your ${limits.dailyChatLimit} messages. Upgrade to Plus.`,
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
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || (language === "es" ? "No se pudo enviar" : "Could not send"),
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
    // Focus input after setting text
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (initialLoading || trialLoading || subscription.isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-background">
        <motion.div 
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-3"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <img src={mascotLime} alt="Loading" className="w-full h-full object-contain" />
        </motion.div>
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (isBlocked) return null;

  if (!isPremium) {
    return (
      <ChatPaywall 
        onUpgrade={() => navigate('/premium-paywall')} 
        onBack={() => navigate('/dashboard')} 
      />
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border/50 bg-card/90 backdrop-blur-xl sticky top-0 z-40 flex-shrink-0 safe-area-top"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className="rounded-full flex-shrink-0 h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-1.5">
                <img src={mascotLime} alt="Chefly" className="w-full h-full object-contain" />
              </div>
              <motion.div 
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold truncate">Chefly</h1>
              <p className="text-xs text-muted-foreground truncate">
                {language === 'es' ? 'Tu coach nutricional' : 'Your nutrition coach'}
              </p>
            </div>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleSound}
            className="p-2 rounded-full hover:bg-muted"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-primary" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
          </motion.button>
          
          {limits.isFreePlan && (
            <Badge variant="outline" className="text-xs">
              {limits.chatMessagesUsed}/{limits.dailyChatLimit}
            </Badge>
          )}
        </div>
      </motion.header>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
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

      {/* Input area */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-t border-border/50 bg-card/90 backdrop-blur-xl px-4 py-3 flex-shrink-0 pb-safe"
      >
        <div className="flex items-end gap-2 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={language === 'es' ? "Escribe tu mensaje..." : "Type your message..."}
              disabled={loading}
              rows={1}
              className={cn(
                "w-full resize-none rounded-2xl border-2 border-border bg-background px-4 py-3 text-[15px]",
                "placeholder:text-muted-foreground focus:outline-none focus:border-primary/50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "min-h-[48px] max-h-[120px]"
              )}
              style={{ height: '48px' }}
            />
          </div>
          
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()} 
              size="icon"
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Chat;
