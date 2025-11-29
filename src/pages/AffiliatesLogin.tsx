import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Home, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";

const AffiliateHeader = () => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Chefly Afiliados</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => navigate("/programa-afiliados")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Información
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function AffiliatesLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Check if already logged in
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if user has affiliate profile
      const { data: profile } = await supabase
        .from("affiliate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (profile) {
        navigate("/affiliates");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has affiliate profile
      const { data: profile } = await supabase
        .from("affiliate_profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!profile) {
        toast({
          title: "No eres afiliado",
          description: "Esta cuenta no está registrada como afiliado. Por favor regístrate primero.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      toast({
        title: "¡Bienvenido!",
        description: "Inicio de sesión exitoso",
      });

      navigate("/affiliates");
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Verifica tus credenciales e intenta nuevamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor verifica que ambas contraseñas sean iguales",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/affiliates`,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "¡Cuenta creada!",
          description: "Ahora completa tu registro de afiliado",
        });
        navigate("/affiliates/register");
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        title: "Error al crear cuenta",
        description: error.message || "No se pudo crear la cuenta. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AffiliateHeader />
      
      <div className="container mx-auto py-12 px-4 max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Portal de Afiliados</h2>
          <p className="text-muted-foreground">
            Inicia sesión o crea tu cuenta para acceder al dashboard
          </p>
        </div>

        <Alert className="mb-6 border-blue-500 bg-blue-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Si aún no eres afiliado, primero crea tu cuenta y luego completa el registro de afiliado.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>
                  Accede a tu cuenta de afiliado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Crear Cuenta</CardTitle>
                <CardDescription>
                  Crea tu cuenta para registrarte como afiliado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      "Crear Cuenta y Continuar"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/programa-afiliados")}
          >
            ¿Necesitas más información?
          </Button>
        </div>
      </div>
    </div>
  );
}
