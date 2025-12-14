import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, ArrowLeft, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Badge } from "@/components/ui/badge";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { limits, refreshLimits } = useSubscriptionLimits(userId);
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();
  const { t } = useLanguage();

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Check chat limit
    if (limits.chatMessagesUsed >= limits.dailyChatLimit) {
      toast({
        variant: "destructive",
        title: t("chat.limitReached"),
        description: t("chat.limitReachedDesc").replace("{{limit}}", limits.dailyChatLimit.toString()),
      });
      navigate("/pricing");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Add user message to UI immediately
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

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

      // Add AI response to messages
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Save AI response to database
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: data.response,
      });

      // Refresh limits after sending
      refreshLimits();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo enviar el mensaje",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading || trialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Header with safe area */}
      <header className="border-b bg-card/95 backdrop-blur-lg sticky top-0 z-40 safe-area-top">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className="touch-target flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">Chefly</h1>
              <p className="text-xs text-muted-foreground truncate">{t("chat.subtitle")}</p>
            </div>
          </div>
          {limits.isBasicPlan && (
            <Badge variant="outline" className="ml-auto flex-shrink-0 text-xs">
              {limits.chatMessagesUsed}/{limits.dailyChatLimit}
            </Badge>
          )}
        </div>
      </header>

      {/* Messages area - flex-1 to fill available space */}
      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-4xl overflow-hidden">
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <Card className="p-6 md:p-8 text-center border-dashed">
                <Bot className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 text-primary" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">¡Hola! Soy Chefly</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {t("chat.welcomeMessage")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 text-left active-scale"
                    onClick={() => setInput("¿Puedo cambiar la cena del martes?")}
                  >
                    "¿Puedo cambiar la cena?"
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 text-left active-scale"
                    onClick={() => setInput("Dame ideas de snacks saludables")}
                  >
                    "Ideas de snacks saludables"
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 text-left active-scale"
                    onClick={() => setInput("¿Qué puedo comer si no tengo horno?")}
                  >
                    "¿Si no tengo horno?"
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 text-left active-scale"
                    onClick={() => setInput("¿Cuánta proteína debo comer?")}
                  >
                    "¿Cuánta proteína necesito?"
                  </Button>
                </div>
              </Card>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 md:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
                    </div>
                  )}
                  <Card
                    className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
                  </Card>
                  {message.role === "user" && (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input area - sticky at bottom with safe area */}
        <form 
          onSubmit={handleSend} 
          className="mt-3 flex gap-2 bg-background pt-2 pb-safe-area-bottom"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.placeholder")}
            disabled={loading}
            className="flex-1 h-11 text-base"
            enterKeyHint="send"
          />
          <Button 
            type="submit" 
            disabled={loading || !input.trim()} 
            variant="hero"
            className="h-11 w-11 md:w-auto md:px-4 touch-target"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
