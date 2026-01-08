import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Target, TrendingDown, TrendingUp, Activity, Heart,
  User, Calendar, Ruler, Scale, Dumbbell,
  Leaf, Utensils, AlertTriangle, ThumbsDown, Globe, Flame,
  ChefHat, Clock, Wallet, UtensilsCrossed,
  Camera, CalendarDays, ShoppingCart, Sparkles
} from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OnboardingOptionCard } from '@/components/onboarding/OnboardingOptionCard';
import { OnboardingMascotInteraction, MascotPose } from '@/components/onboarding/OnboardingMascotInteraction';
import { OnboardingNumericInput } from '@/components/onboarding/OnboardingNumericInput';
import { OnboardingDatePicker } from '@/components/onboarding/OnboardingDatePicker';
import { OnboardingValueScreen } from '@/components/onboarding/OnboardingValueScreen';
import { OnboardingAuthStep } from '@/components/onboarding/OnboardingAuthStep';
import { usePreOnboardingState } from '@/hooks/usePreOnboardingState';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 23;

const PreOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customAllergy, setCustomAllergy] = useState('');
  const [customDislike, setCustomDislike] = useState('');
  
  const { 
    data, 
    updateField, 
    toggleArrayItem,
    clearData,
    calculateNutritionGoals 
  } = usePreOnboardingState();

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

  const handleAuthSuccess = async (userId: string) => {
    setIsSubmitting(true);
    
    try {
      const goals = calculateNutritionGoals();
      const age = data.birthDate 
        ? new Date().getFullYear() - data.birthDate.getFullYear() 
        : 25;
      
      // Save user preferences
      const { error: prefsError } = await supabase.from('user_preferences').insert({
        user_id: userId,
        goal: data.goal,
        diet_type: data.dietType || 'omnivore',
        allergies: data.allergies,
        dislikes: data.dislikes,
        cooking_skill: data.cookingSkill,
        cooking_time: data.cookingTime,
        budget: data.budget,
        meals_per_day: data.mealsPerDay,
        activity_level: data.activityLevel,
        gender: data.gender,
        age,
        height: data.heightUnit === 'ft' ? Math.round(data.height * 30.48) : data.height,
        weight: data.weightUnit === 'lb' ? Math.round(data.weight * 0.453592) : data.weight,
        target_weight: data.targetWeight || null,
        daily_calorie_goal: goals.calories,
        daily_protein_goal: goals.protein,
        daily_carbs_goal: goals.carbs,
        daily_fats_goal: goals.fats,
        preferred_cuisines: data.cuisines,
        flavor_preferences: data.flavors,
        meal_complexity: data.mealComplexity,
        servings: 1,
      });

      if (prefsError) throw prefsError;

      // Save profile with display name
      const { error: profileError } = await supabase.from('profiles').update({
        display_name: data.name,
      }).eq('id', userId);

      if (profileError) console.warn('Profile update error:', profileError);

      // Initialize user stats
      await supabase.from('user_stats').insert({
        user_id: userId,
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        meals_completed: 0,
        level: 1,
      });

      // Clear localStorage data
      clearData();

      // Generate initial meal plan
      toast({
        title: "¡Bienvenido a Chefly! 🎉",
        description: "Estamos creando tu plan personalizado...",
      });

      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast({
        title: "Error",
        description: "Hubo un problema guardando tus datos. Intenta de nuevo.",
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
      case 5: return !!data.gender;
      case 6: return !!data.birthDate;
      case 7: return data.height > 0;
      case 8: return data.weight > 0;
      case 9: return data.goal !== 'lose_weight' && data.goal !== 'gain_muscle' || data.targetWeight > 0;
      case 10: return !!data.activityLevel;
      case 11: return !!data.dietType;
      case 16: return !!data.cookingSkill;
      case 17: return data.cookingTime > 0;
      case 18: return !!data.budget;
      case 19: return data.mealsPerDay >= 2;
      default: return true;
    }
  };

  // Get mascot message for current step
  const getMascotMessage = (): { message: string; pose: MascotPose } => {
    switch (step) {
      case 1:
        return { message: "¡Hola! 👋 Soy Chefly, tu coach nutricional. ¿Cómo te llamas?", pose: 'default' };
      case 2:
        return { message: `¡Un placer conocerte, ${data.name}! 🎉 Juntos vamos a lograr grandes cosas.`, pose: 'celebrating' };
      case 3:
        return { message: "Cuéntame, ¿cuál es tu objetivo principal? 🎯", pose: 'default' };
      case 4:
        return { message: `¡Excelente elección! ${getGoalMessage()} 💪`, pose: 'flexing' };
      case 5:
        return { message: "Para personalizar tu plan, necesito conocerte mejor. ¿Cómo te identificas?", pose: 'default' };
      case 6:
        return { message: "¿Cuándo naciste? 🎂 Esto me ayuda a calcular tus necesidades.", pose: 'default' };
      case 7:
        return { message: "¿Cuánto mides? 📏", pose: 'default' };
      case 8:
        return { message: "¿Cuánto pesas actualmente? ⚖️", pose: 'default' };
      case 9:
        return { message: "¿Cuál es tu peso objetivo? 🎯", pose: 'fire' };
      case 10:
        return { message: "¿Qué tan activo eres en tu día a día? 🏃", pose: 'default' };
      case 11:
        return { message: "¿Sigues algún tipo de alimentación específica? 🥗", pose: 'cooking' };
      case 12:
        return { message: "¿Tienes alguna alergia o intolerancia? ⚠️", pose: 'default' };
      case 13:
        return { message: "¿Hay alimentos que prefieras evitar? 🚫", pose: 'default' };
      case 14:
        return { message: "¿Qué cocinas te gustan más? 🌍", pose: 'cooking' };
      case 15:
        return { message: "¿Qué sabores prefieres? 😋", pose: 'default' };
      case 16:
        return { message: "¿Cómo describirías tu nivel en la cocina? 👨‍🍳", pose: 'cooking' };
      case 17:
        return { message: "¿Cuánto tiempo tienes para cocinar? ⏱️", pose: 'working' };
      case 18:
        return { message: "¿Cuál es tu presupuesto para comida? 💰", pose: 'money' };
      case 19:
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

  // Skip step 9 if goal doesn't require target weight
  useEffect(() => {
    if (step === 9 && data.goal !== 'lose_weight' && data.goal !== 'gain_muscle') {
      handleNext();
    }
  }, [step, data.goal]);

  const renderStep = () => {
    const mascot = getMascotMessage();

    switch (step) {
      // STEP 1: Name input
      case 1:
        return (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
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

      // STEP 4: Goal confirmation celebration
      case 4:
        return (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <OnboardingMascotInteraction 
              message={mascot.message} 
              pose={mascot.pose}
              size="large"
              showCelebration
            />
          </div>
        );

      // STEP 5: Gender
      case 5:
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

      // STEP 6: Birth date
      case 6:
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

      // STEP 7: Height
      case 7:
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

      // STEP 8: Current weight
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

      // STEP 9: Target weight (conditional)
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
              value={data.targetWeight}
              onChange={(v) => updateField('targetWeight', v)}
              unit={data.weightUnit}
              placeholder="65"
            />
          </div>
        );

      // STEP 10: Activity level
      case 10:
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

      // STEP 11: Diet type
      case 11:
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

      // STEP 12: Allergies
      case 12:
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

      // STEP 13: Dislikes
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

      // STEP 14: Cuisines
      case 14:
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

      // STEP 15: Flavors
      case 15:
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

      // STEP 16: Cooking skill
      case 16:
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

      // STEP 17: Cooking time
      case 17:
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

      // STEP 18: Budget
      case 18:
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

      // STEP 19: Meals per day
      case 19:
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

      // STEP 20: Value screen - Food scanner
      case 20:
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

      // STEP 21: Value screen - Meal plan
      case 21:
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

      // STEP 22: Value screen - Shopping list
      case 22:
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

      // STEP 23: Auth
      case 23:
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

  // Determine if we should show the next button
  const showNextButton = step !== 23 && step !== 2 && step !== 4;
  
  // Auto-advance celebration steps
  useEffect(() => {
    if (step === 2 || step === 4) {
      const timer = setTimeout(() => {
        handleNext();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      onBack={handleBack}
      onNext={handleNext}
      showNext={showNextButton}
      nextDisabled={!canProceed()}
      nextLabel={step >= 20 && step <= 22 ? "Continuar" : "Siguiente"}
      showBack={step > 1 && step !== 23}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

export default PreOnboarding;
