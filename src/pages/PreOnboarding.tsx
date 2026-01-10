import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Target, TrendingDown, TrendingUp, Activity, Heart,
  User, Calendar, Ruler, Scale, Dumbbell,
  Leaf, Utensils, AlertTriangle, ThumbsDown, Globe, Flame,
  ChefHat, Clock, Wallet, UtensilsCrossed,
  Camera, CalendarDays, ShoppingCart, Sparkles,
  Lightbulb, Ban, Timer, Zap, Users, Trophy
} from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingOptionCard } from '@/components/onboarding/OnboardingOptionCard';
import { OnboardingMascotInteraction, MascotPose } from '@/components/onboarding/OnboardingMascotInteraction';
import { OnboardingNumericInput } from '@/components/onboarding/OnboardingNumericInput';
import { OnboardingDatePicker } from '@/components/onboarding/OnboardingDatePicker';
import { OnboardingValueScreen } from '@/components/onboarding/OnboardingValueScreen';
import { OnboardingAuthStep } from '@/components/onboarding/OnboardingAuthStep';
import { OnboardingMilestone } from '@/components/onboarding/OnboardingMilestone';
import { ProgressStages } from '@/components/onboarding/ProgressStages';
import { NutritionRevealScreen } from '@/components/onboarding/NutritionRevealScreen';
import { usePreOnboardingState } from '@/hooks/usePreOnboardingState';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Extended flow with new questions
const TOTAL_STEPS = 28;

const PreOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customAllergy, setCustomAllergy] = useState('');
  const [customDislike, setCustomDislike] = useState('');
  const [showMilestone, setShowMilestone] = useState<string | null>(null);
  const [showNutritionReveal, setShowNutritionReveal] = useState(false);
  
  const { 
    data, 
    updateField, 
    toggleArrayItem,
    clearData,
    calculateNutritionGoals,
    calculateAge,
    getSavedStep,
    saveStep,
  } = usePreOnboardingState();

  // Restore saved step on mount
  useEffect(() => {
    const savedStep = getSavedStep();
    if (savedStep > 1) {
      setStep(savedStep);
    }
  }, [getSavedStep]);

  // Persist step changes
  useEffect(() => {
    saveStep(step);
  }, [step, saveStep]);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleNutritionRevealComplete = () => {
    setShowNutritionReveal(false);
    handleNext(); // Move to auth step
  };

  const handleAuthSuccess = async (userId: string, isNewUser: boolean) => {
    setIsSubmitting(true);
    
    try {
      // For login (existing users), check if they already have preferences
      if (!isNewUser) {
        const { data: existingPrefs } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (existingPrefs) {
          // User already has data, go directly to dashboard
          clearData();
          toast({
            title: "¡Bienvenido de vuelta! 👋",
            description: "Te redirigimos a tu dashboard...",
          });
          navigate('/dashboard', { replace: true });
          return;
        }
      }
      
      // For new users, wait for profile trigger to complete with retry
      if (isNewUser) {
        let profileExists = false;
        let attempts = 0;
        const maxAttempts = 8; // Increased from 5 to 8 (4 seconds total)
        
        while (!profileExists && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
          
          profileExists = !!profile;
          attempts++;
          console.log(`Waiting for profile... attempt ${attempts}/${maxAttempts}`);
        }
        
        // If profile still doesn't exist after retries, create it manually
        if (!profileExists) {
          console.warn('Profile not created by trigger, creating manually...');
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            await supabase.from('profiles').insert({
              id: userId,
              email: user.email,
            });
          }
        }
      }
      
      // Validate required fields
      if (!data.goal) {
        toast({
          title: "Datos incompletos",
          description: "Por favor completa todos los pasos del onboarding.",
          variant: "destructive",
        });
        setStep(3); // Go back to goal step
        setIsSubmitting(false);
        return;
      }
      
      const goals = calculateNutritionGoals();
      const age = calculateAge();
      
      // Use upsert to avoid duplicate key errors
      const { error: prefsError } = await supabase.from('user_preferences').upsert({
        user_id: userId,
        goal: data.goal || 'eat_healthy',
        diet_type: data.dietType || 'omnivore',
        allergies: data.allergies,
        dislikes: data.dislikes,
        cooking_skill: data.cookingSkill || 'intermediate',
        cooking_time: data.cookingTime || 30,
        budget: data.budget || 'medium',
        meals_per_day: data.mealsPerDay || 3,
        activity_level: data.activityLevel || 'moderate',
        gender: data.gender || 'other',
        age: age || 25,
        height: data.heightUnit === 'ft' ? Math.round(data.height * 30.48) : (data.height || 170),
        weight: data.weightUnit === 'lb' ? Math.round(data.weight * 0.453592) : (data.weight || 70),
        target_weight: data.targetWeight || null,
        daily_calorie_goal: goals.calories || 2000,
        daily_protein_goal: goals.protein || 100,
        daily_carbs_goal: goals.carbs || 250,
        daily_fats_goal: goals.fats || 65,
        preferred_cuisines: data.cuisines,
        flavor_preferences: data.flavors,
        meal_complexity: data.mealComplexity || 'medium',
        servings: 1,
      }, { onConflict: 'user_id' });

      if (prefsError) {
        console.error('Preferences error:', prefsError);
        throw prefsError;
      }

      // Update profile with display name
      const { error: profileError } = await supabase.from('profiles').update({
        display_name: data.name || 'Usuario',
      }).eq('id', userId);

      if (profileError) console.warn('Profile update error:', profileError);

      // Use upsert for user_stats too
      const { error: statsError } = await supabase.from('user_stats').upsert({
        user_id: userId,
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        meals_completed: 0,
        level: 1,
      }, { onConflict: 'user_id' });

      if (statsError) console.warn('Stats upsert error:', statsError);

      // Clear localStorage data
      clearData();

      // Success notification
      toast({
        title: "¡Bienvenido a Chefly! 🎉",
        description: "Estamos creando tu plan personalizado...",
      });

      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('Error saving data:', error);
      
      let message = "Hubo un problema guardando tus datos. Intenta de nuevo.";
      
      // Specific error messages
      if (error.code === '23505') {
        // Duplicate key - this shouldn't happen with upsert, but just in case
        message = "Parece que ya tienes una cuenta configurada. Intenta iniciar sesión.";
      } else if (error.code === '42501') {
        // RLS violation
        message = "Error de permisos. Por favor intenta de nuevo.";
      } else if (error.message?.includes('JWT')) {
        message = "Tu sesión expiró. Por favor inicia sesión de nuevo.";
      }
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step validation
  const canProceed = (): boolean => {
    switch (step) {
      case 1: return data.name.trim().length >= 2;
      case 3: return !!data.goal;
      case 4: return data.motivation.length > 0;
      case 6: return !!data.gender;
      case 7: return !!data.birthDate;
      case 8: return data.height > 0;
      case 9: return data.weight > 0;
      case 10: return data.goal !== 'lose_weight' && data.goal !== 'gain_muscle' || data.targetWeight > 0;
      case 12: return !!data.activityLevel;
      case 13: return data.obstacles.length > 0;
      case 14: return !!data.timeline;
      case 15: return !!data.dietType;
      case 20: return !!data.cookingSkill;
      case 21: return data.cookingTime > 0;
      case 22: return !!data.budget;
      case 23: return data.mealsPerDay >= 2;
      default: return true;
    }
  };

  // Get mascot message for current step
  const getMascotMessage = (): { message: string; pose: MascotPose } => {
    switch (step) {
      case 1:
        return { message: "¡Hola! 👋 Soy Chefly, tu coach nutricional. ¿Cómo te llamas?", pose: 'happy' };
      case 2:
        return { message: `¡Un placer conocerte, ${data.name}! 🎉 Juntos vamos a lograr grandes cosas.`, pose: 'celebrating' };
      case 3:
        return { message: "Cuéntame, ¿cuál es tu objetivo principal? 🎯", pose: 'default' };
      case 4:
        return { message: "¿Qué te motiva a hacer este cambio? 💡", pose: 'happy' };
      case 6:
        return { message: "Para personalizar tu plan, necesito conocerte mejor. ¿Cómo te identificas?", pose: 'default' };
      case 7:
        return { message: "¿Cuándo naciste? 🎂 Esto me ayuda a calcular tus necesidades.", pose: 'default' };
      case 8:
        return { message: "¿Cuánto mides? 📏", pose: 'default' };
      case 9:
        return { message: "¿Cuánto pesas actualmente? ⚖️", pose: 'default' };
      case 10:
        return { message: "¿Cuál es tu peso objetivo? 🎯", pose: 'strong' };
      case 12:
        return { message: "¿Qué tan activo eres en tu día a día? 🏃", pose: 'health' };
      case 13:
        return { message: "¿Cuál es tu mayor obstáculo para comer bien? 🚧", pose: 'science' };
      case 14:
        return { message: "¿Para cuándo te gustaría alcanzar tu objetivo? ⏰", pose: 'strong' };
      case 15:
        return { message: "¿Sigues algún tipo de alimentación específica? 🥗", pose: 'science' };
      case 16:
        return { message: "¿Tienes alguna alergia o intolerancia? ⚠️", pose: 'default' };
      case 17:
        return { message: "¿Hay alimentos que prefieras evitar? 🚫", pose: 'default' };
      case 18:
        return { message: "¿Qué cocinas te gustan más? 🌍", pose: 'happy' };
      case 19:
        return { message: "¿Qué sabores prefieres? 😋", pose: 'happy' };
      case 20:
        return { message: "¿Cómo describirías tu nivel en la cocina? 👨‍🍳", pose: 'science' };
      case 21:
        return { message: "¿Cuánto tiempo tienes para cocinar? ⏱️", pose: 'science' };
      case 22:
        return { message: "¿Cuál es tu presupuesto para comida? 💰", pose: 'happy' };
      case 23:
        return { message: "¿Cuántas comidas haces al día? 🍽️", pose: 'default' };
      default:
        return { message: "¡Vamos muy bien! 🚀", pose: 'default' };
    }
  };

  const getGoalMessage = () => {
    switch (data.goal) {
      case 'lose_weight': return "Perder peso de forma saludable es posible.";
      case 'gain_muscle': return "Ganar músculo requiere la nutrición correcta.";
      case 'maintain': return "Mantener un peso saludable es clave.";
      case 'eat_healthier': return "Comer mejor cambiará tu vida.";
      case 'save_time': return "Te ayudaré a ahorrar tiempo en la cocina.";
      default: return "";
    }
  };

  // Handle milestone completions
  const handleMilestoneComplete = () => {
    setShowMilestone(null);
    handleNext();
  };

  // Skip step 10 if goal doesn't require target weight
  useEffect(() => {
    if (step === 10 && data.goal !== 'lose_weight' && data.goal !== 'gain_muscle') {
      handleNext();
    }
  }, [step, data.goal]);

  // Celebration steps (2, 5, 11) now require manual continue - no auto-advance

  // Trigger nutrition reveal at step 27
  useEffect(() => {
    if (step === 27) {
      setShowNutritionReveal(true);
    }
  }, [step]);

  // Render step content
  const renderStep = () => {
    const mascot = getMascotMessage();

    switch (step) {
      // STEP 1: Name input
      case 1:
        return (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            {/* Login link for returning users */}
            <div className="absolute top-4 right-4">
              <a 
                href="/auth" 
                className="text-xs text-primary hover:underline font-medium"
              >
                Iniciar sesión
              </a>
            </div>
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="large"
            />
            <div className="w-full max-w-xs mt-8">
              <Input
                type="text"
                placeholder="Tu nombre"
                value={data.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="text-center text-xl py-6 border-2"
                autoFocus
              />
            </div>
          </div>
        );

      // STEP 2: Greeting celebration
      case 2:
        return (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="large"
              showCelebration
              onContinue={handleNext}
              continueLabel="¡Vamos!"
            />
          </div>
        );

      // STEP 3: Goal selection
      case 3:
        return (
          <div className="flex-1 flex flex-col px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <div className="space-y-3">
              {[
                { id: 'lose_weight', label: 'Perder peso', icon: TrendingDown, desc: 'Reducir grasa de forma saludable' },
                { id: 'gain_muscle', label: 'Ganar músculo', icon: TrendingUp, desc: 'Aumentar masa muscular' },
                { id: 'maintain', label: 'Mantener peso', icon: Activity, desc: 'Conservar mi peso actual' },
                { id: 'eat_healthier', label: 'Comer más sano', icon: Heart, desc: 'Mejorar mi alimentación' },
                { id: 'save_time', label: 'Ahorrar tiempo', icon: Clock, desc: 'Planificar comidas fácilmente' },
              ].map((option) => (
                <OnboardingOptionCard
                  key={option.id}
                  label={option.label}
                  description={option.desc}
                  icon={<option.icon className="w-6 h-6" />}
                  selected={data.goal === option.id}
                  onClick={() => updateField('goal', option.id)}
                />
              ))}
            </div>
          </div>
        );

      // STEP 4: Motivation (NEW)
      case 4:
        return (
          <div className="flex-1 flex flex-col px-6 py-8 overflow-auto">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-4"
            />
            <p className="text-center text-sm text-muted-foreground mb-4">
              Selecciona todas las que apliquen
            </p>
            <div className="space-y-3">
              {[
                { id: 'health', label: 'Mejorar mi salud', icon: Heart, desc: 'Sentirme mejor físicamente' },
                { id: 'appearance', label: 'Verme mejor', icon: User, desc: 'Mejorar mi apariencia' },
                { id: 'energy', label: 'Más energía', icon: Zap, desc: 'Tener más vitalidad' },
                { id: 'family', label: 'Por mi familia', icon: Users, desc: 'Dar el ejemplo' },
                { id: 'sport', label: 'Rendimiento deportivo', icon: Trophy, desc: 'Mejorar en mi deporte' },
              ].map((option) => (
                <OnboardingOptionCard
                  key={option.id}
                  label={option.label}
                  description={option.desc}
                  icon={<option.icon className="w-5 h-5" />}
                  selected={data.motivation.includes(option.id)}
                  onClick={() => toggleArrayItem('motivation', option.id)}
                />
              ))}
            </div>
          </div>
        );

      // STEP 5: Goal confirmation milestone
      case 5:
        return (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <OnboardingMascotInteraction 
              message={`¡Excelente! ${getGoalMessage()} Tu "por qué" está claro 💪`}
              pose="strong"
              size="large"
              showCelebration
              onContinue={handleNext}
              continueLabel="Continuar"
            />
          </div>
        );

      // STEP 6: Gender
      case 6:
        return (
          <div className="flex-1 flex flex-col px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <div className="space-y-3">
              {[
                { id: 'male', label: 'Hombre' },
                { id: 'female', label: 'Mujer' },
                { id: 'other', label: 'Prefiero no decir' },
              ].map((option) => (
                <OnboardingOptionCard
                  key={option.id}
                  label={option.label}
                  selected={data.gender === option.id}
                  onClick={() => updateField('gender', option.id)}
                  size="large"
                />
              ))}
            </div>
          </div>
        );

      // STEP 7: Birth date
      case 7:
        return (
          <div className="flex-1 flex flex-col px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <OnboardingDatePicker
              value={data.birthDate}
              onChange={(date) => updateField('birthDate', date)}
            />
          </div>
        );

      // STEP 8: Height
      case 8:
        return (
          <div className="flex-1 flex flex-col px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <OnboardingNumericInput
              value={data.height}
              onChange={(v) => updateField('height', v)}
              unit={data.heightUnit}
              placeholder="170"
            />
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => updateField('heightUnit', 'cm')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  data.heightUnit === 'cm' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                cm
              </button>
              <button
                onClick={() => updateField('heightUnit', 'ft')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  data.heightUnit === 'ft' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                ft
              </button>
            </div>
          </div>
        );

      // STEP 9: Current weight
      case 9:
        return (
          <div className="flex-1 flex flex-col px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <OnboardingNumericInput
              value={data.weight}
              onChange={(v) => updateField('weight', v)}
              unit={data.weightUnit}
              placeholder="70"
            />
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => updateField('weightUnit', 'kg')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  data.weightUnit === 'kg' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                kg
              </button>
              <button
                onClick={() => updateField('weightUnit', 'lb')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  data.weightUnit === 'lb' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                lb
              </button>
            </div>
          </div>
        );

      // STEP 10: Target weight (conditional)
      case 10:
        return (
          <div className="flex-1 flex flex-col px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <OnboardingNumericInput
              value={data.targetWeight}
              onChange={(v) => updateField('targetWeight', v)}
              unit={data.weightUnit}
              placeholder="65"
            />
          </div>
        );

      // STEP 11: Body data milestone
      case 11:
        return (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <OnboardingMascotInteraction 
              message="¡Perfecto! Ya conozco tu cuerpo 📊 Ahora personalizaré todo para ti."
              pose="science"
              size="large"
              showCelebration
              onContinue={handleNext}
              continueLabel="Continuar"
            />
          </div>
        );

      // STEP 12: Activity level
      case 12:
        return (
          <div className="flex-1 flex flex-col px-6 py-8 overflow-auto">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <div className="space-y-3">
              {[
                { id: 'sedentary', label: 'Sedentario', desc: 'Trabajo de oficina, poco ejercicio' },
                { id: 'light', label: 'Ligeramente activo', desc: 'Ejercicio 1-2 veces por semana' },
                { id: 'moderate', label: 'Moderadamente activo', desc: 'Ejercicio 3-5 veces por semana' },
                { id: 'active', label: 'Muy activo', desc: 'Ejercicio intenso 6-7 veces por semana' },
                { id: 'very_active', label: 'Extra activo', desc: 'Atleta o trabajo físico intenso' },
              ].map((option) => (
                <OnboardingOptionCard
                  key={option.id}
                  label={option.label}
                  description={option.desc}
                  selected={data.activityLevel === option.id}
                  onClick={() => updateField('activityLevel', option.id)}
                  size="compact"
                />
              ))}
            </div>
          </div>
        );

      // STEP 13: Obstacles (NEW)
      case 13:
        return (
          <div className="flex-1 flex flex-col px-6 py-8 overflow-auto">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-4"
            />
            <p className="text-center text-sm text-muted-foreground mb-4">
              Selecciona los que apliquen
            </p>
            <div className="space-y-3">
              {[
                { id: 'time', label: 'Falta de tiempo', icon: Clock, desc: 'No tengo tiempo para cocinar' },
                { id: 'motivation', label: 'Motivación', icon: Zap, desc: 'Me cuesta mantenerme constante' },
                { id: 'cooking', label: 'No sé cocinar', icon: ChefHat, desc: 'Mis habilidades son limitadas' },
                { id: 'cravings', label: 'Antojos', icon: Heart, desc: 'Me cuesta resistir tentaciones' },
                { id: 'social', label: 'Eventos sociales', icon: Users, desc: 'Comer fuera es difícil' },
              ].map((option) => (
                <OnboardingOptionCard
                  key={option.id}
                  label={option.label}
                  description={option.desc}
                  icon={<option.icon className="w-5 h-5" />}
                  selected={data.obstacles.includes(option.id)}
                  onClick={() => toggleArrayItem('obstacles', option.id)}
                />
              ))}
            </div>
          </div>
        );

      // STEP 14: Timeline (NEW)
      case 14:
        return (
          <div className="flex-1 flex flex-col px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <div className="space-y-3">
              {[
                { id: '1_month', label: '1 mes', desc: 'Cambios rápidos pero intensos' },
                { id: '3_months', label: '3 meses', desc: 'Ritmo constante y sostenible' },
                { id: '6_months', label: '6 meses', desc: 'Transformación completa' },
                { id: '1_year', label: '1 año o más', desc: 'Sin prisa, hábitos para siempre' },
              ].map((option) => (
                <OnboardingOptionCard
                  key={option.id}
                  label={option.label}
                  description={option.desc}
                  icon={<Timer className="w-5 h-5" />}
                  selected={data.timeline === option.id}
                  onClick={() => updateField('timeline', option.id)}
                />
              ))}
            </div>
          </div>
        );

      // STEP 15: Diet type
      case 15:
        return (
          <div className="flex-1 flex flex-col px-6 py-8 overflow-auto">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <div className="space-y-3">
              {[
                { id: 'omnivore', label: 'Como de todo', icon: Utensils },
                { id: 'vegetarian', label: 'Vegetariano', icon: Leaf },
                { id: 'vegan', label: 'Vegano', icon: Leaf },
                { id: 'keto', label: 'Keto / Bajo en carbos', icon: Flame },
                { id: 'mediterranean', label: 'Mediterránea', icon: Globe },
              ].map((option) => (
                <OnboardingOptionCard
                  key={option.id}
                  label={option.label}
                  icon={<option.icon className="w-5 h-5" />}
                  selected={data.dietType === option.id}
                  onClick={() => updateField('dietType', option.id)}
                />
              ))}
            </div>
          </div>
        );

      // STEP 16: Allergies
      case 16:
        return (
          <div className="flex-1 flex flex-col px-6 py-8 overflow-auto">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-4"
            />
            <p className="text-center text-sm text-muted-foreground mb-4">
              Selecciona todas las que apliquen (opcional)
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {['Gluten', 'Lácteos', 'Huevo', 'Mariscos', 'Frutos secos', 'Soya', 'Cacahuates'].map((allergy) => (
                <Badge
                  key={allergy}
                  variant={data.allergies.includes(allergy) ? 'default' : 'outline'}
                  className="cursor-pointer py-2 px-4 text-sm"
                  onClick={() => toggleArrayItem('allergies', allergy)}
                >
                  {allergy}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 max-w-xs mx-auto">
              <Input
                placeholder="Agregar otra..."
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                className="flex-1"
              />
              <button
                onClick={() => {
                  if (customAllergy.trim()) {
                    toggleArrayItem('allergies', customAllergy.trim());
                    setCustomAllergy('');
                  }
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                +
              </button>
            </div>
            {data.allergies.length > 0 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Seleccionadas: {data.allergies.join(', ')}
              </div>
            )}
          </div>
        );

      // STEP 17: Dislikes
      case 17:
        return (
          <div className="flex-1 flex flex-col px-6 py-8 overflow-auto">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-4"
            />
            <p className="text-center text-sm text-muted-foreground mb-4">
              Selecciona alimentos que no te gusten (opcional)
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {['Cebolla', 'Ajo', 'Cilantro', 'Picante', 'Pescado', 'Hígado', 'Champiñones', 'Brócoli'].map((item) => (
                <Badge
                  key={item}
                  variant={data.dislikes.includes(item) ? 'default' : 'outline'}
                  className="cursor-pointer py-2 px-4 text-sm"
                  onClick={() => toggleArrayItem('dislikes', item)}
                >
                  {item}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 max-w-xs mx-auto">
              <Input
                placeholder="Agregar otro..."
                value={customDislike}
                onChange={(e) => setCustomDislike(e.target.value)}
                className="flex-1"
              />
              <button
                onClick={() => {
                  if (customDislike.trim()) {
                    toggleArrayItem('dislikes', customDislike.trim());
                    setCustomDislike('');
                  }
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                +
              </button>
            </div>
          </div>
        );

      // STEP 18: Cuisines
      case 18:
        return (
          <div className="flex-1 flex flex-col px-6 py-8 overflow-auto">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-4"
            />
            <p className="text-center text-sm text-muted-foreground mb-4">
              Selecciona tus favoritas (opcional)
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Mexicana', 'Italiana', 'Asiática', 'Mediterránea', 'Americana', 'Japonesa', 'India', 'Francesa', 'Española', 'Árabe'].map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={data.cuisines.includes(cuisine) ? 'default' : 'outline'}
                  className="cursor-pointer py-2 px-4 text-sm"
                  onClick={() => toggleArrayItem('cuisines', cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>
        );

      // STEP 19: Flavors + Gustos milestone
      case 19:
        return (
          <div className="flex-1 flex flex-col px-6 py-8 overflow-auto">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-4"
            />
            <p className="text-center text-sm text-muted-foreground mb-4">
              Selecciona tus preferidos (opcional)
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Dulce', 'Salado', 'Picante', 'Ácido', 'Umami', 'Ahumado', 'Herbáceo', 'Cremoso'].map((flavor) => (
                <Badge
                  key={flavor}
                  variant={data.flavors.includes(flavor) ? 'default' : 'outline'}
                  className="cursor-pointer py-2 px-4 text-sm"
                  onClick={() => toggleArrayItem('flavors', flavor)}
                >
                  {flavor}
                </Badge>
              ))}
            </div>
          </div>
        );

      // STEP 20: Cooking skill
      case 20:
        return (
          <div className="flex-1 flex flex-col px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <div className="space-y-3">
              {[
                { id: 'beginner', label: 'Principiante', desc: 'Apenas sé hacer lo básico', icon: ChefHat },
                { id: 'intermediate', label: 'Intermedio', desc: 'Me defiendo bien en la cocina', icon: ChefHat },
                { id: 'advanced', label: 'Avanzado', desc: 'Cocino de todo con confianza', icon: ChefHat },
              ].map((option) => (
                <OnboardingOptionCard
                  key={option.id}
                  label={option.label}
                  description={option.desc}
                  icon={<option.icon className="w-5 h-5" />}
                  selected={data.cookingSkill === option.id}
                  onClick={() => updateField('cookingSkill', option.id)}
                />
              ))}
            </div>
          </div>
        );

      // STEP 21: Cooking time
      case 21:
        return (
          <div className="flex-1 flex flex-col px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <div className="space-y-3">
              {[
                { id: 15, label: '15 minutos', desc: 'Recetas rápidas y simples' },
                { id: 30, label: '30 minutos', desc: 'Tiempo ideal para la mayoría' },
                { id: 45, label: '45 minutos', desc: 'Recetas más elaboradas' },
                { id: 60, label: '1 hora o más', desc: 'Me gusta tomarme mi tiempo' },
              ].map((option) => (
                <OnboardingOptionCard
                  key={option.id}
                  label={option.label}
                  description={option.desc}
                  icon={<Clock className="w-5 h-5" />}
                  selected={data.cookingTime === option.id}
                  onClick={() => updateField('cookingTime', option.id)}
                />
              ))}
            </div>
          </div>
        );

      // STEP 22: Budget
      case 22:
        return (
          <div className="flex-1 flex flex-col px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <div className="space-y-3">
              {[
                { id: 'low', label: 'Económico', desc: 'Ingredientes accesibles' },
                { id: 'medium', label: 'Moderado', desc: 'Balance calidad-precio' },
                { id: 'high', label: 'Sin límite', desc: 'Los mejores ingredientes' },
              ].map((option) => (
                <OnboardingOptionCard
                  key={option.id}
                  label={option.label}
                  description={option.desc}
                  icon={<Wallet className="w-5 h-5" />}
                  selected={data.budget === option.id}
                  onClick={() => updateField('budget', option.id)}
                />
              ))}
            </div>
          </div>
        );

      // STEP 23: Meals per day
      case 23:
        return (
          <div className="flex-1 flex flex-col px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="small"
              className="mb-6"
            />
            <div className="space-y-3">
              {[2, 3, 4, 5].map((num) => (
                <OnboardingOptionCard
                  key={num}
                  label={`${num} comidas`}
                  description={num === 3 ? 'Lo más común' : num === 2 ? 'Ayuno intermitente' : 'Comidas más pequeñas'}
                  icon={<UtensilsCrossed className="w-5 h-5" />}
                  selected={data.mealsPerDay === num}
                  onClick={() => updateField('mealsPerDay', num)}
                />
              ))}
            </div>
          </div>
        );

      // STEP 24: Value screen - Food scanner
      case 24:
        return (
          <OnboardingValueScreen
            icon={Camera}
            title="Escanea tu comida"
            description="Toma una foto de cualquier platillo y obtén su información nutricional al instante."
            features={[
              'Análisis nutricional con IA',
              'Detecta ingredientes automáticamente',
              'Guarda tu historial de comidas',
            ]}
            gradient="primary"
          />
        );

      // STEP 25: Value screen - Meal plan
      case 25:
        return (
          <OnboardingValueScreen
            icon={CalendarDays}
            title="Plan semanal personalizado"
            description="Recibe un menú completo adaptado a tus gustos, objetivos y tiempo disponible."
            features={[
              'Recetas paso a paso',
              'Calculado para tus macros',
              'Cambia platillos fácilmente',
            ]}
            gradient="secondary"
          />
        );

      // STEP 26: Value screen - Shopping list
      case 26:
        return (
          <OnboardingValueScreen
            icon={ShoppingCart}
            title="Lista de compras inteligente"
            description="Genera automáticamente tu lista de supermercado organizada por categorías."
            features={[
              'Organizada por secciones',
              'Marca lo que ya tienes',
              'Exporta a PDF',
            ]}
            gradient="accent"
          />
        );

      // STEP 27: Nutrition Reveal Screen
      case 27:
        if (showNutritionReveal) {
          const goals = calculateNutritionGoals();
          const age = calculateAge();
          const weight = data.weightUnit === 'lb' ? Math.round(data.weight * 0.453592) : data.weight;
          const targetWeight = data.targetWeight 
            ? (data.weightUnit === 'lb' ? Math.round(data.targetWeight * 0.453592) : data.targetWeight)
            : weight;

          return (
            <NutritionRevealScreen
              goals={goals}
              userSummary={{
                name: data.name,
                age,
                goal: data.goal,
                currentWeight: weight,
                targetWeight,
                activityLevel: data.activityLevel,
                dietType: data.dietType,
                timeline: data.timeline,
              }}
              onComplete={handleNutritionRevealComplete}
            />
          );
        }
        return null;

      // STEP 28: Auth
      case 28:
        return (
          <OnboardingAuthStep
            userName={data.name}
            onAuthSuccess={handleAuthSuccess}
          />
        );

      default:
        return null;
    }
  };

  // Determine if we should show navigation
  const showNextButton = step !== 28 && step !== 2 && step !== 5 && step !== 11 && step !== 27;
  const showBackButton = step > 1 && step !== 28 && step !== 27;

  return (
    <>
      {/* Progress stages bar */}
      {step < 27 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
          <ProgressStages currentStage={step} />
        </div>
      )}

      <OnboardingLayout
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        onBack={handleBack}
        onNext={handleNext}
        showNext={showNextButton}
        nextDisabled={!canProceed()}
        nextLabel={step >= 24 && step <= 26 ? "Continuar" : "Siguiente"}
        showBack={showBackButton}
      >
        <div className={step < 27 ? "pt-16" : ""}>
          {renderStep()}
        </div>
      </OnboardingLayout>

      {/* Milestones overlay */}
      <OnboardingMilestone
        title="¡Tu objetivo está claro!"
        subtitle="Ya sé exactamente qué quieres lograr"
        icon="sparkles"
        show={showMilestone === 'goal'}
        onComplete={handleMilestoneComplete}
      />
    </>
  );
};

export default PreOnboarding;
