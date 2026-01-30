import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import mascotLime from '@/assets/mascot-lime.png';
import { Capacitor } from '@capacitor/core';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { Separator } from '@/components/ui/separator';

interface OnboardingAuthStepProps {
  userName: string;
  onAuthSuccess: (userId: string, isNewUser: boolean) => void;
}

export const OnboardingAuthStep: React.FC<OnboardingAuthStepProps> = ({
  userName,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const { toast } = useToast();
  const isNativePlatform = Capacitor.isNativePlatform();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa tu correo y contraseña",
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

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Usuario existente",
              description: "Este correo ya está registrado. Intenta iniciar sesión.",
              variant: "destructive",
            });
            setMode('login');
          } else {
            throw error;
          }
          return;
        }

        if (data.user) {
          onAuthSuccess(data.user.id, true);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          onAuthSuccess(data.user.id, false);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || socialLoading;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      {/* Mascot with message */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center mb-6"
      >
        <motion.img
          src={mascotLime}
          alt="Chefly"
          className="w-20 h-20 mb-4"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <h2 className="text-xl font-bold text-center">
          ¡Perfecto, {userName}! 🎉
        </h2>
        <p className="text-muted-foreground text-center mt-1">
          Crea tu cuenta para guardar tu plan personalizado
        </p>
      </motion.div>

      {/* Auth form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm space-y-4"
      >
        {/* Quick login link for returning users */}
        <p className="text-xs text-muted-foreground text-center">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => setMode('login')}
            className="text-primary hover:underline font-medium"
          >
            Iniciar sesión
          </button>
        </p>

        {/* Social Auth Buttons - Hidden on native platforms */}
        {!isNativePlatform && (
          <>
            <SocialAuthButtons 
              disabled={isLoading} 
              onLoadingChange={setSocialLoading} 
            />
            <div className="relative">
              <Separator />
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground absolute -top-2">
                  O con correo
                </span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 py-6"
              disabled={isFormDisabled}
            />
          </div>
          
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10 py-6"
              disabled={isFormDisabled}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-base"
            disabled={isFormDisabled}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'signup' ? (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-primary hover:underline"
              >
                Inicia sesión
              </button>
            </>
          ) : (
            <>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-primary hover:underline"
              >
                Regístrate
              </button>
            </>
          )}
        </p>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Al continuar, aceptas nuestros{' '}
          <a href="/terms" className="underline">Términos</a> y{' '}
          <a href="/privacy" className="underline">Privacidad</a>
        </p>
      </motion.div>
    </div>
  );
};
