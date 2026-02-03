import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Shield, Clock, Utensils, ChefHat } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import cheflyLogo from "@/assets/chefly-logo.png";
import { Capacitor } from "@capacitor/core";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isNativePlatform = Capacitor.isNativePlatform();

  useEffect(() => {
    let navigated = false;
    
    const checkPreferencesAndNavigate = async (userId: string) => {
      if (navigated || hasNavigated) return;
      navigated = true;
      setHasNavigated(true);
      
      try {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (preferences) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/start", { replace: true });
        }
      } catch (error) {
        console.error('Error checking preferences:', error);
        navigate("/start", { replace: true });
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !navigated) {
        checkPreferencesAndNavigate(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && !navigated) {
        setTimeout(() => {
          checkPreferencesAndNavigate(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, hasNavigated]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email) || email.length > 255) {
        throw new Error(t("auth.invalidEmail"));
      }
      
      if (!password || password.length < 8 || password.length > 128) {
        throw new Error(t("auth.passwordLength"));
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: t("auth.accountCreated"),
        description: t("auth.accountCreatedDesc"),
      });
      
      navigate("/start");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("auth.error"),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        throw new Error(t("auth.invalidEmail"));
      }
      
      if (!password || password.length < 6) {
        throw new Error(t("auth.invalidPassword"));
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      toast({
        title: t("auth.welcomeBack"),
        description: t("auth.welcomeBackDesc"),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("auth.loginError"),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Utensils,
      title: language === 'es' ? "Menús 100% personalizados" : "100% personalized menus",
      description: language === 'es' ? "Adaptados a tus gustos, alergias y objetivos" : "Adapted to your tastes, allergies and goals"
    },
    {
      icon: ChefHat,
      title: language === 'es' ? "Recetas fáciles de preparar" : "Easy-to-make recipes",
      description: language === 'es' ? "Con ingredientes accesibles y pasos claros" : "With accessible ingredients and clear steps"
    },
    {
      icon: Clock,
      title: language === 'es' ? "Ahorra tiempo y dinero" : "Save time and money",
      description: language === 'es' ? "Lista de compras automática y sin desperdicios" : "Automatic shopping list with no waste"
    },
    {
      icon: Shield,
      title: language === 'es' ? "Plan gratuito incluido" : "Free plan included",
      description: language === 'es' ? "Sin compromiso ni tarjeta de crédito" : "No commitment or credit card required"
    }
  ];

  const isFormDisabled = loading || socialLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex">
      {/* Left side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-lg"
        >
          <div className="flex items-center gap-3 mb-8">
            <img src={cheflyLogo} alt="Chefly.AI" className="h-12 w-12" />
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Chefly.AI
              </span>
            </h1>
          </div>
          
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {language === 'es' ? 'Tu nutrición, simplificada' : 'Your nutrition, simplified'}
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            {language === 'es' 
              ? 'Únete a miles de personas que ya transformaron su alimentación con inteligencia artificial'
              : 'Join thousands of people who have already transformed their nutrition with artificial intelligence'}
          </p>

          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src={cheflyLogo} alt="Chefly.AI" className="h-10 w-10" />
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  Chefly.AI
                </span>
              </h1>
            </div>
            <p className="text-muted-foreground mb-4">{t("auth.tagline")}</p>
            
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[200px] snap-start bg-primary/5 rounded-lg p-3 border border-primary/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <benefit.icon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">{benefit.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-left">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <Card className="shadow-2xl border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t("auth.accessAccount")}</CardTitle>
              <CardDescription className="text-base">
                {t("auth.trialInfo")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                  <TabsTrigger value="signup" className="text-base">{t("auth.signup")}</TabsTrigger>
                  <TabsTrigger value="signin" className="text-base">{t("auth.login")}</TabsTrigger>
                </TabsList>

                <TabsContent value="signup">
                  {/* Social Auth Buttons - Show on web only */}
                  <SocialAuthButtons 
                    disabled={loading} 
                    onLoadingChange={setSocialLoading} 
                  />
                  {/* Show separator only if social buttons are visible (web only) */}
                  {!isNativePlatform && (
                    <div className="relative my-4">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        {language === 'es' ? 'o con email' : 'or with email'}
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t("auth.email")}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t("auth.emailPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isFormDisabled}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t("auth.password")}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder={t("auth.passwordPlaceholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        maxLength={128}
                        disabled={isFormDisabled}
                        className="h-12"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold" 
                      variant="hero"
                      disabled={isFormDisabled}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t("common.loading")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          {t("auth.signup")}
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signin">
                  {/* Social Auth Buttons - Show on web only */}
                  <SocialAuthButtons 
                    disabled={loading} 
                    onLoadingChange={setSocialLoading} 
                  />
                  {/* Show separator only if social buttons are visible (web only) */}
                  {!isNativePlatform && (
                    <div className="relative my-4">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        {language === 'es' ? 'o con email' : 'or with email'}
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">{t("auth.email")}</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder={t("auth.emailPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isFormDisabled}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">{t("auth.password")}</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isFormDisabled}
                        className="h-12"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold"
                      disabled={isFormDisabled}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t("common.loading")}
                        </>
                      ) : (
                        t("auth.login")
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Trust indicators */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>{t("auth.freeTrial")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-secondary" />
                    <span>{t("auth.noCreditCard")}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-6">
                {t("auth.termsAgree")}{" "}
                <button 
                  onClick={() => navigate("/terms")} 
                  className="text-primary hover:underline"
                >
                  {t("auth.termsLink")}
                </button>
                {" "}{t("auth.and")}{" "}
                <button 
                  onClick={() => navigate("/privacy")} 
                  className="text-primary hover:underline"
                >
                  {t("auth.privacyLink")}
                </button>
              </p>
            </CardContent>
          </Card>

          {/* Mobile benefits */}
          <div className="lg:hidden mt-8 grid grid-cols-2 gap-3">
            {benefits.slice(0, 4).map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
              >
                <benefit.icon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-xs text-muted-foreground">{benefit.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
