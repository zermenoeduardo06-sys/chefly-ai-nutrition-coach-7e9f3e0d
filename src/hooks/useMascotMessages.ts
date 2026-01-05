import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MascotMood } from '@/contexts/MascotContext';

interface MascotMessage {
  text: string;
  mood: MascotMood;
}

interface UserContext {
  streak?: number;
  caloriesConsumed?: number;
  caloriesGoal?: number;
  mealsCompleted?: number;
  totalMeals?: number;
  pendingChallenges?: number;
  userName?: string;
}

export const useMascotMessages = (userContext: UserContext = {}) => {
  const { language } = useLanguage();
  
  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const getMealTime = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' | null => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9) return 'breakfast';
    if (hour >= 12 && hour <= 14) return 'lunch';
    if (hour >= 19 && hour <= 21) return 'dinner';
    if (hour >= 16 && hour <= 17) return 'snack';
    return null;
  };

  const messages = useMemo(() => {
    const isEs = language === 'es';
    const timeOfDay = getTimeOfDay();
    const mealTime = getMealTime();
    const { streak = 0, caloriesConsumed = 0, caloriesGoal = 2000, mealsCompleted = 0, pendingChallenges = 0 } = userContext;
    
    const caloriesProgress = caloriesGoal > 0 ? (caloriesConsumed / caloriesGoal) * 100 : 0;

    // Greeting messages based on time
    const greetings: Record<string, MascotMessage[]> = {
      morning: [
        { text: isEs ? '¡Buenos días! ☀️ Listo para un día saludable?' : 'Good morning! ☀️ Ready for a healthy day?', mood: 'happy' },
        { text: isEs ? '¡Arriba! Es hora del desayuno 🥣' : 'Rise and shine! Breakfast time 🥣', mood: 'motivated' },
      ],
      afternoon: [
        { text: isEs ? '¡Buenas tardes! ¿Cómo va tu día?' : 'Good afternoon! How\'s your day going?', mood: 'idle' },
        { text: isEs ? '¡Sigue así! Ya pasó la mitad del día 💪' : 'Keep it up! Halfway through the day 💪', mood: 'motivated' },
      ],
      evening: [
        { text: isEs ? '¡Buenas noches! Hora de una cena ligera 🌙' : 'Good evening! Time for a light dinner 🌙', mood: 'idle' },
        { text: isEs ? '¿Qué tal estuvo tu día? 🌆' : 'How was your day? 🌆', mood: 'happy' },
      ],
      night: [
        { text: isEs ? '¡Hora de descansar! 😴 Nos vemos mañana' : 'Time to rest! 😴 See you tomorrow', mood: 'sleepy' },
        { text: isEs ? 'Dulces sueños 💤' : 'Sweet dreams 💤', mood: 'sleepy' },
      ],
    };

    // Meal time messages
    const mealMessages: Record<string, MascotMessage[]> = {
      breakfast: [
        { text: isEs ? '¡Es hora del desayuno! 🍳 El combustible del día' : 'Breakfast time! 🍳 Fuel for the day', mood: 'hungry' },
      ],
      lunch: [
        { text: isEs ? '¡Hora del almuerzo! 🥗 Recarga energías' : 'Lunch time! 🥗 Recharge your energy', mood: 'hungry' },
      ],
      dinner: [
        { text: isEs ? '¡Hora de cenar! 🍽️ Come ligero' : 'Dinner time! 🍽️ Keep it light', mood: 'hungry' },
      ],
      snack: [
        { text: isEs ? '¿Un snack saludable? 🍎' : 'Healthy snack time? 🍎', mood: 'idle' },
      ],
    };

    // Streak messages
    const streakMessages: MascotMessage[] = [];
    if (streak >= 7) {
      streakMessages.push({ 
        text: isEs ? `¡Increíble! ${streak} días seguidos 🔥🔥🔥` : `Amazing! ${streak} days in a row 🔥🔥🔥`, 
        mood: 'proud' 
      });
    } else if (streak >= 3) {
      streakMessages.push({ 
        text: isEs ? `¡${streak} días de racha! Sigue así 🔥` : `${streak} day streak! Keep going 🔥`, 
        mood: 'motivated' 
      });
    } else if (streak === 0) {
      streakMessages.push({ 
        text: isEs ? '¡Hoy empezamos de nuevo! Tú puedes 💪' : 'Fresh start today! You got this 💪', 
        mood: 'encouraging' 
      });
    }

    // Progress messages
    const progressMessages: MascotMessage[] = [];
    if (caloriesProgress >= 90 && caloriesProgress <= 110) {
      progressMessages.push({ 
        text: isEs ? '¡Perfecto! Estás en tu meta de calorías 🎯' : 'Perfect! You\'re at your calorie goal 🎯', 
        mood: 'celebrating' 
      });
    } else if (caloriesProgress >= 50) {
      progressMessages.push({ 
        text: isEs ? '¡Vas muy bien! Ya llevas más de la mitad 📊' : 'Great progress! More than halfway there 📊', 
        mood: 'happy' 
      });
    } else if (caloriesProgress < 30 && timeOfDay !== 'morning') {
      progressMessages.push({ 
        text: isEs ? '¡No olvides registrar tus comidas! 📝' : 'Don\'t forget to log your meals! 📝', 
        mood: 'encouraging' 
      });
    }

    // Challenge messages
    const challengeMessages: MascotMessage[] = [];
    if (pendingChallenges > 0) {
      challengeMessages.push({ 
        text: isEs ? `¡Tienes ${pendingChallenges} reto${pendingChallenges > 1 ? 's' : ''} pendiente${pendingChallenges > 1 ? 's' : ''}! 🎯` : `You have ${pendingChallenges} pending challenge${pendingChallenges > 1 ? 's' : ''}! 🎯`, 
        mood: 'motivated' 
      });
    }

    // Random motivational messages
    const motivational: MascotMessage[] = [
      { text: isEs ? '¡Cada comida cuenta! 🌟' : 'Every meal counts! 🌟', mood: 'motivated' },
      { text: isEs ? '¡Eres increíble! 💚' : 'You\'re amazing! 💚', mood: 'happy' },
      { text: isEs ? 'Pequeños pasos, grandes cambios 🚀' : 'Small steps, big changes 🚀', mood: 'encouraging' },
      { text: isEs ? '¡La consistencia es la clave! 🔑' : 'Consistency is key! 🔑', mood: 'motivated' },
      { text: isEs ? '¡Tú puedes con todo! 💪' : 'You can do anything! 💪', mood: 'proud' },
    ];

    return {
      greetings: greetings[timeOfDay] || [],
      mealTime: mealTime ? mealMessages[mealTime] : [],
      streak: streakMessages,
      progress: progressMessages,
      challenges: challengeMessages,
      motivational,
      all: [
        ...(greetings[timeOfDay] || []),
        ...(mealTime ? mealMessages[mealTime] : []),
        ...streakMessages,
        ...progressMessages,
        ...challengeMessages,
        ...motivational,
      ],
    };
  }, [language, userContext]);

  const getRandomMessage = (category?: keyof typeof messages): MascotMessage => {
    const pool = category && category !== 'all' ? messages[category] : messages.all;
    if (pool.length === 0) {
      return { text: language === 'es' ? '¡Hola! 👋' : 'Hello! 👋', mood: 'happy' };
    }
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const getContextualMessage = (): MascotMessage => {
    // Priority: meal time > challenges > progress > streak > greeting > motivational
    if (messages.mealTime.length > 0 && Math.random() > 0.5) {
      return messages.mealTime[0];
    }
    if (messages.challenges.length > 0 && Math.random() > 0.3) {
      return messages.challenges[0];
    }
    if (messages.progress.length > 0 && Math.random() > 0.4) {
      return messages.progress[0];
    }
    if (messages.streak.length > 0 && Math.random() > 0.5) {
      return messages.streak[0];
    }
    if (messages.greetings.length > 0 && Math.random() > 0.3) {
      return getRandomMessage('greetings');
    }
    return getRandomMessage('motivational');
  };

  return {
    messages,
    getRandomMessage,
    getContextualMessage,
    getTimeOfDay,
    getMealTime,
  };
};
