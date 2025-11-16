import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.features": "Características",
    "nav.pricing": "Precios",
    "nav.login": "Iniciar Sesión",
    "nav.signup": "Registrarse",
    
    // Hero Section
    "hero.title": "Tu Coach Nutricional con IA",
    "hero.subtitle": "Menús personalizados, recetas deliciosas y una IA que te guía hacia tus objetivos de salud",
    "hero.cta": "Comienza Gratis",
    "hero.trial": "Prueba 7 días gratis",
    
    // Stats
    "stats.users": "Usuarios activos",
    "stats.meals": "Comidas generadas",
    "stats.rating": "Calificación",
    "stats.success": "Éxito comprobado",
    
    // Features
    "features.title": "Todo lo que necesitas para transformar tu alimentación",
    "features.ai.title": "IA Personalizada",
    "features.ai.desc": "Menús adaptados a tus objetivos y preferencias",
    "features.recipes.title": "Recetas Deliciosas",
    "features.recipes.desc": "Comidas saludables que te encantarán",
    "features.goals.title": "Alcanza tus Metas",
    "features.goals.desc": "Bajar grasa, ganar músculo o comer saludable",
    "features.time.title": "Ahorra Tiempo",
    "features.time.desc": "Lista de compras automática cada semana",
    
    // How it works
    "how.title": "Cómo funciona",
    "how.step1.title": "Cuéntanos tus objetivos",
    "how.step1.desc": "Responde unas preguntas sobre tu estilo de vida y metas",
    "how.step2.title": "IA genera tu menú",
    "how.step2.desc": "Recibe un plan semanal personalizado al instante",
    "how.step3.title": "Disfruta y progresa",
    "how.step3.desc": "Sigue tu plan, chatea con tu coach y alcanza tus metas",
    
    // Pricing
    "pricing.title": "Elige tu plan perfecto",
    "pricing.subtitle": "Comienza con 7 días gratis. Cancela cuando quieras.",
    "pricing.month": "mes",
    "pricing.cta": "Comenzar ahora",
    "pricing.comingSoon": "Próximamente",
    
    // Testimonials
    "testimonials.title": "Lo que dicen nuestros usuarios",
    "testimonials.1.name": "María González",
    "testimonials.1.role": "Bajó 8kg en 2 meses",
    "testimonials.1.text": "Chefly.AI cambió mi vida. Los menús son deliciosos y fáciles de seguir. ¡Perdí peso sin sufrir!",
    "testimonials.2.name": "Carlos Ramírez",
    "testimonials.2.role": "Ganó 5kg de músculo",
    "testimonials.2.text": "Como atleta, necesitaba una nutrición precisa. La IA me creó el plan perfecto para mis entrenamientos.",
    "testimonials.3.name": "Ana Martínez",
    "testimonials.3.role": "Mejoró su salud",
    "testimonials.3.text": "Tengo diabetes y el coach nutricional me ayudó a comer mejor. Mis análisis mejoraron increíblemente.",
    
    // Contact
    "contact.title": "¿Tienes preguntas?",
    "contact.subtitle": "Envíanos un mensaje y te responderemos pronto",
    
    // Sidebar
    "sidebar.dashboard": "Dashboard",
    "sidebar.progress": "Progreso Nutricional",
    "sidebar.achievements": "Logros y Medallas",
    "sidebar.challenges": "Desafíos Diarios",
    "sidebar.leaderboard": "Clasificación",
    "sidebar.coach": "Coach IA",
    "sidebar.subscription": "Mi Suscripción",
    "sidebar.logout": "Cerrar sesión",
    "sidebar.menu": "Menú Principal",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.login": "Log In",
    "nav.signup": "Sign Up",
    
    // Hero Section
    "hero.title": "Your AI Nutrition Coach",
    "hero.subtitle": "Personalized menus, delicious recipes, and an AI that guides you to your health goals",
    "hero.cta": "Start Free",
    "hero.trial": "7-day free trial",
    
    // Stats
    "stats.users": "Active users",
    "stats.meals": "Meals generated",
    "stats.rating": "Rating",
    "stats.success": "Proven success",
    
    // Features
    "features.title": "Everything you need to transform your nutrition",
    "features.ai.title": "Personalized AI",
    "features.ai.desc": "Menus adapted to your goals and preferences",
    "features.recipes.title": "Delicious Recipes",
    "features.recipes.desc": "Healthy meals you'll love",
    "features.goals.title": "Reach Your Goals",
    "features.goals.desc": "Lose fat, gain muscle, or eat healthy",
    "features.time.title": "Save Time",
    "features.time.desc": "Automatic shopping list every week",
    
    // How it works
    "how.title": "How it works",
    "how.step1.title": "Tell us your goals",
    "how.step1.desc": "Answer a few questions about your lifestyle and goals",
    "how.step2.title": "AI generates your menu",
    "how.step2.desc": "Get a personalized weekly plan instantly",
    "how.step3.title": "Enjoy and progress",
    "how.step3.desc": "Follow your plan, chat with your coach, and reach your goals",
    
    // Pricing
    "pricing.title": "Choose your perfect plan",
    "pricing.subtitle": "Start with a 7-day free trial. Cancel anytime.",
    "pricing.month": "month",
    "pricing.cta": "Start now",
    "pricing.comingSoon": "Coming Soon",
    
    // Testimonials
    "testimonials.title": "What our users say",
    "testimonials.1.name": "María González",
    "testimonials.1.role": "Lost 8kg in 2 months",
    "testimonials.1.text": "Chefly.AI changed my life. The menus are delicious and easy to follow. I lost weight without suffering!",
    "testimonials.2.name": "Carlos Ramírez",
    "testimonials.2.role": "Gained 5kg of muscle",
    "testimonials.2.text": "As an athlete, I needed precise nutrition. The AI created the perfect plan for my training.",
    "testimonials.3.name": "Ana Martínez",
    "testimonials.3.role": "Improved her health",
    "testimonials.3.text": "I have diabetes and the nutrition coach helped me eat better. My test results improved incredibly.",
    
    // Contact
    "contact.title": "Have questions?",
    "contact.subtitle": "Send us a message and we'll get back to you soon",
    
    // Sidebar
    "sidebar.dashboard": "Dashboard",
    "sidebar.progress": "Nutrition Progress",
    "sidebar.achievements": "Achievements & Badges",
    "sidebar.challenges": "Daily Challenges",
    "sidebar.leaderboard": "Leaderboard",
    "sidebar.coach": "AI Coach",
    "sidebar.subscription": "My Subscription",
    "sidebar.logout": "Log out",
    "sidebar.menu": "Main Menu",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "en" || saved === "es") ? saved : "es";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.es] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
