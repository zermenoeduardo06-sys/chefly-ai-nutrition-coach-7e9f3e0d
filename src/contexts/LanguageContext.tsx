import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getArray: (key: string) => string[];
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
    "contact.form.title": "Envíanos un mensaje",
    "contact.form.subtitle": "Completa el formulario y te responderemos lo antes posible",
    "contact.form.name": "Nombre completo",
    "contact.form.email": "Correo electrónico",
    "contact.form.subject": "Asunto",
    "contact.form.message": "Mensaje",
    "contact.form.submit": "Enviar mensaje",
    "contact.form.success": "¡Mensaje enviado!",
    "contact.form.successDesc": "Gracias por contactarnos. Revisaremos tu mensaje y te responderemos pronto.",
    "contact.form.sendAnother": "Enviar otro mensaje",
    "contact.form.error": "Error al enviar el mensaje",
    "contact.form.errorDesc": "Por favor, inténtalo de nuevo más tarde.",
    "contact.validation.nameRequired": "El nombre es requerido",
    "contact.validation.nameMax": "El nombre debe tener máximo 100 caracteres",
    "contact.validation.emailInvalid": "Email inválido",
    "contact.validation.emailMax": "El email debe tener máximo 255 caracteres",
    "contact.validation.subjectRequired": "El asunto es requerido",
    "contact.validation.subjectMax": "El asunto debe tener máximo 200 caracteres",
    "contact.validation.messageMin": "El mensaje debe tener al menos 10 caracteres",
    "contact.validation.messageMax": "El mensaje debe tener máximo 2000 caracteres",
    
    // Auth
    "auth.welcome": "Bienvenido a",
    "auth.subtitle": "Tu entrenador alimenticio con IA",
    "auth.login": "Iniciar Sesión",
    "auth.signup": "Crear Cuenta",
    "auth.email": "Correo electrónico",
    "auth.password": "Contraseña",
    "auth.accountCreated": "¡Cuenta creada!",
    "auth.accountCreatedDesc": "Bienvenido a Chefly.AI. Configuremos tus preferencias.",
    "auth.welcomeBack": "¡Bienvenido de nuevo!",
    "auth.welcomeBackDesc": "Iniciando sesión...",
    "auth.error": "Error",
    "auth.loginError": "Error al iniciar sesión",
    "auth.invalidEmail": "Correo electrónico inválido",
    "auth.invalidPassword": "Contraseña inválida",
    "auth.passwordLength": "La contraseña debe tener entre 8 y 128 caracteres",
    "auth.backToHome": "Volver al inicio",
    
    // FAQ
    "faq.title": "Preguntas Frecuentes",
    "faq.subtitle": "Encuentra respuestas a las preguntas más comunes sobre Chefly.AI",
    "faq.backToHome": "Volver al inicio",
    
    // Common
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.success": "Éxito",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.close": "Cerrar",
    "common.back": "Volver",
    "common.next": "Siguiente",
    "common.previous": "Anterior",
    "common.finish": "Finalizar",
    
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
    
    // Dashboard
    "dashboard.days": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    "dashboard.meals.breakfast": "Desayuno",
    "dashboard.meals.lunch": "Almuerzo",
    "dashboard.meals.dinner": "Cena",
    "dashboard.welcome": "¡Bienvenido de nuevo!",
    "dashboard.welcomeMessage": "Aquí está tu plan nutricional de la semana",
    "dashboard.trialExpired": "Tu periodo de prueba ha terminado",
    "dashboard.trialExpiredDesc": "Suscríbete para continuar usando Chefly.AI",
    "dashboard.subscribe": "Suscribirse ahora",
    "dashboard.stats": "Tus Estadísticas",
    "dashboard.level": "Nivel",
    "dashboard.totalPoints": "Puntos Totales",
    "dashboard.currentStreak": "Racha Actual",
    "dashboard.longestStreak": "Racha Más Larga",
    "dashboard.mealsCompleted": "Comidas Completadas",
    "dashboard.days_one": "día",
    "dashboard.days_other": "días",
    "dashboard.weeklyPlan": "Plan Semanal",
    "dashboard.generateNew": "Generar Nuevo Plan",
    "dashboard.generating": "Generando plan personalizado...",
    "dashboard.aiThinking": "La IA está creando tu menú perfecto",
    "dashboard.noMealPlan": "No tienes un plan de comidas aún",
    "dashboard.createFirst": "Crea tu primer plan personalizado",
    "dashboard.generatePlan": "Generar Plan",
    "dashboard.noPreferences": "Primero configura tus preferencias",
    "dashboard.setupPreferences": "Configurar Preferencias",
    "dashboard.todaySummary": "Resumen de Hoy",
    "dashboard.completedMeals": "Comidas Completadas",
    "dashboard.viewSummary": "Ver Resumen del Día",
    "dashboard.quickActions": "Acciones Rápidas",
    "dashboard.chatCoach": "Chatear con Coach IA",
    "dashboard.viewProgress": "Ver Progreso",
    "dashboard.editPreferences": "Editar Preferencias",
    "dashboard.trendingUp": "Tendencia al alza",
    "dashboard.errorGenerate": "Error al generar plan",
    "dashboard.tryAgain": "Inténtalo de nuevo más tarde",
    "dashboard.planGenerated": "¡Plan generado!",
    "dashboard.planReady": "Tu plan semanal está listo",
    "dashboard.mealCompleted": "¡Comida completada!",
    "dashboard.pointsEarned": "Has ganado {{points}} puntos",
    "dashboard.keepStreak": "Mantén tu racha activa",
    "dashboard.errorComplete": "Error al completar comida",
    "dashboard.unlocked": "Desbloqueado",
    "dashboard.viewDetails": "Ver detalles",
    "dashboard.swapMeal": "Cambiar comida",
    "dashboard.markComplete": "Marcar como completada",
    "dashboard.completed": "Completada",
    "dashboard.limitReached": "Límite alcanzado",
    "dashboard.limitReachedDesc": "Has alcanzado el límite de {{limit}} planes mensuales. Actualiza al plan Intermedio para planes ilimitados.",
    "dashboard.upgradePlan": "Actualizar Plan",
    
    // Onboarding
    "onboarding.step": "Paso {{current}} de {{total}}",
    "onboarding.basicInfo": "Información Básica",
    "onboarding.goal": "¿Cuál es tu objetivo principal?",
    "onboarding.goalDesc": "Esto nos ayudará a personalizar tu plan",
    "onboarding.goals.lose_fat": "Bajar grasa",
    "onboarding.goals.gain_muscle": "Ganar músculo",
    "onboarding.goals.eat_healthy": "Comer saludable",
    "onboarding.goals.save_money": "Comer barato",
    "onboarding.dietType": "¿Qué tipo de dieta sigues?",
    "onboarding.diets.omnivore": "Omnívora",
    "onboarding.diets.vegetarian": "Vegetariana",
    "onboarding.diets.vegan": "Vegana",
    "onboarding.diets.keto": "Keto",
    "onboarding.diets.paleo": "Paleo",
    "onboarding.mealsPerDay": "¿Cuántas comidas prefieres al día?",
    "onboarding.allergies": "Alergias o restricciones alimentarias",
    "onboarding.allergiesDesc": "Opcional - presiona Enter para agregar",
    "onboarding.allergiesPlaceholder": "Ej: nueces, lácteos, gluten",
    "onboarding.personalPreferences": "Preferencias Personales",
    "onboarding.cookingSkill": "Nivel de habilidad en la cocina",
    "onboarding.skills.beginner": "Principiante - Recetas simples",
    "onboarding.skills.intermediate": "Intermedio - Puedo seguir la mayoría de recetas",
    "onboarding.skills.advanced": "Avanzado - Me gusta cocinar platos complejos",
    "onboarding.budget": "Presupuesto para alimentos",
    "onboarding.budgets.low": "Bajo - Ingredientes económicos",
    "onboarding.budgets.medium": "Medio - Balance entre precio y calidad",
    "onboarding.budgets.high": "Alto - Ingredientes premium",
    "onboarding.cookingTime": "Tiempo disponible para cocinar (minutos)",
    "onboarding.servings": "Número de porciones por comida",
    "onboarding.dislikes": "Ingredientes que no te gustan",
    "onboarding.dislikesDesc": "Opcional - presiona Enter para agregar",
    "onboarding.dislikesPlaceholder": "Ej: brócoli, pescado",
    "onboarding.flavorPreferences": "Preferencias de sabor",
    "onboarding.flavorDesc": "Selecciona tus sabores favoritos",
    "onboarding.flavors": ["Dulce", "Salado", "Picante", "Ácido", "Umami", "Amargo"],
    "onboarding.additionalInfo": "Información Adicional",
    "onboarding.mealComplexity": "Complejidad de recetas preferida",
    "onboarding.complexity.simple": "Simple - Pocos pasos y ingredientes",
    "onboarding.complexity.moderate": "Moderado - Recetas estándar",
    "onboarding.complexity.complex": "Complejo - Recetas elaboradas",
    "onboarding.cuisines": "Tipos de cocina preferidos",
    "onboarding.cuisinesList": ["Mexicana", "Italiana", "Asiática", "Mediterránea", "Americana", "Vegetariana", "Saludable"],
    "onboarding.activityLevel": "Nivel de actividad física",
    "onboarding.activities.sedentary": "Sedentario - Poco o ningún ejercicio",
    "onboarding.activities.light": "Ligero - Ejercicio 1-2 días/semana",
    "onboarding.activities.moderate": "Moderado - Ejercicio 3-5 días/semana",
    "onboarding.activities.active": "Activo - Ejercicio 6-7 días/semana",
    "onboarding.activities.very_active": "Muy activo - Ejercicio intenso diario",
    "onboarding.demographics": "Información demográfica (opcional)",
    "onboarding.age": "Edad",
    "onboarding.weight": "Peso (kg)",
    "onboarding.gender": "Género",
    "onboarding.genders.male": "Masculino",
    "onboarding.genders.female": "Femenino",
    "onboarding.genders.other": "Otro",
    "onboarding.genders.prefer_not": "Prefiero no decir",
    "onboarding.additionalNotes": "Notas adicionales",
    "onboarding.notesPlaceholder": "Cualquier otra información que quieras compartir sobre tus preferencias nutricionales...",
    "onboarding.inputTooLong": "Entrada muy larga",
    "onboarding.inputTooLongDesc": "La entrada no puede tener más de 100 caracteres",
    "onboarding.errorSaving": "Error al guardar preferencias",
    "onboarding.errorSavingDesc": "Por favor, inténtalo de nuevo",
    "onboarding.preferencesSaved": "¡Preferencias guardadas!",
    "onboarding.redirecting": "Redirigiendo a tu dashboard...",
    
    // Chat
    "chat.title": "Coach Nutricional IA",
    "chat.backToDashboard": "Volver al Dashboard",
    "chat.placeholder": "Escribe tu pregunta sobre nutrición...",
    "chat.send": "Enviar",
    "chat.limitReached": "Límite de mensajes alcanzado",
    "chat.limitReachedDesc": "Has alcanzado el límite de {{limit}} mensajes diarios del plan Básico. Actualiza al plan Intermedio para chat ilimitado.",
    "chat.messagesUsed": "Mensajes usados hoy",
    "chat.messagesLimit": "de {{limit}} diarios",
    "chat.unlimited": "ilimitado",
    "chat.welcome": "¡Hola! Soy tu coach nutricional con IA. ¿En qué puedo ayudarte hoy?",
    "chat.errorSending": "Error al enviar mensaje",
    "chat.errorSendingDesc": "Por favor, inténtalo de nuevo",
    
    // Privacy & Terms
    "privacy.title": "Política de Privacidad",
    "privacy.lastUpdated": "Última actualización",
    "privacy.back": "Volver",
    "terms.title": "Términos y Condiciones",
    "terms.lastUpdated": "Última actualización",
    "terms.back": "Volver",
    
    // NotFound
    "notfound.title": "404",
    "notfound.heading": "Página no encontrada",
    "notfound.message": "Lo sentimos, la página que buscas no existe o ha sido movida.",
    "notfound.goBack": "Volver atrás",
    "notfound.goHome": "Ir al inicio",
    
    // Meal Detail
    "mealDetail.nutritionalInfo": "Información Nutricional",
    "mealDetail.calories": "Calorías",
    "mealDetail.protein": "Proteína",
    "mealDetail.carbs": "Carbohidratos",
    "mealDetail.fats": "Grasas",
    "mealDetail.benefits": "Beneficios",
    "mealDetail.ingredients": "Ingredientes",
    "mealDetail.steps": "Pasos a seguir",
    "mealDetail.swapMeal": "Intercambiar comida",
    "mealDetail.lockedMessage": "Necesitas estar suscrito para intercambiar comidas",
    
    // Swap Meal
    "swapMeal.title": "Intercambiar comida",
    "swapMeal.description": "Selecciona con qué comida quieres intercambiar",
    
    // Challenges
    "challenges.title": "Desafíos Diarios",
    "challenges.subtitle": "Completa desafíos para ganar puntos extra",
    "challenges.noChallenges": "No hay desafíos activos",
    "challenges.generateNew": "Generar nuevos desafíos",
    "challenges.generating": "Generando...",
    "challenges.errorLoading": "No se pudieron cargar los desafíos",
    "challenges.errorGenerating": "No se pudieron generar los desafíos",
    "challenges.challengesGenerated": "¡Desafíos generados!",
    "challenges.newChallenges": "Tienes 3 nuevos desafíos diarios",
    "challenges.complete": "Completar",
    "challenges.completed": "¡Completado!",
    "challenges.progress": "Progreso",
    "challenges.reward": "Recompensa",
    "challenges.bonus": "Bonus",
    "challenges.points": "puntos",
    
    // Achievements
    "achievements.title": "Logros y Medallas",
    "achievements.subtitle": "Desbloquea medallas completando retos",
    "achievements.unlocked": "Desbloqueado",
    "achievements.points": "pts",
    
    // Nutrition Charts
    "nutritionCharts.title": "Progreso Nutricional",
    "nutritionCharts.subtitle": "Visualiza tu evolución en el tiempo",
    "nutritionCharts.weekly": "Semanal (28 días)",
    "nutritionCharts.monthly": "Mensual (12 semanas)",
    "nutritionCharts.calories": "Calorías",
    "nutritionCharts.protein": "Proteínas",
    "nutritionCharts.carbs": "Carbohidratos",
    "nutritionCharts.fats": "Grasas",
    "nutritionCharts.mealsCompleted": "Comidas Completadas",
    "nutritionCharts.noData": "No hay datos disponibles aún. Completa comidas para ver tu progreso.",
    
    // Confirm Plan
    "confirmPlan.title": "¿Generar nuevo plan semanal?",
    "confirmPlan.description": "Esto reemplazará tu plan actual. Elige cómo quieres generar tu nuevo menú:",
    "confirmPlan.cached": "Usar menú existente (Recomendado)",
    "confirmPlan.cachedDesc": "Reutiliza un menú con tus mismas preferencias. No consume créditos de IA. ✨",
    "confirmPlan.new": "Generar menú completamente nuevo",
    "confirmPlan.newDesc": "Crea un menú único con IA. Consume créditos de Lovable AI. 🤖",
    "confirmPlan.cancel": "Cancelar",
    "confirmPlan.generate": "Generar plan",
    "confirmPlan.generating": "Generando...",
    
    // Daily Summary
    "dailySummary.title": "¡Día Completado!",
    "dailySummary.subtitle": "Resumen nutricional de",
    "dailySummary.congrats": "¡Excelente trabajo completando todas tus comidas del día!",
    "dailySummary.totalCalories": "Calorías Totales",
    "dailySummary.kcal": "kcal",
    "dailySummary.proteins": "Proteínas",
    "dailySummary.carbohydrates": "Carbohidratos",
    "dailySummary.fats": "Grasas",
    "dailySummary.motivational": "Mantén este ritmo para alcanzar tus objetivos de salud 💪",
    
    // Subscription Banner
    "subscription.activePlan": "Plan",
    "subscription.active": "Activo",
    "subscription.managePlan": "Gestionar plan",
    "subscription.enjoyBenefits": "Disfruta de todos los beneficios de tu plan",
    "subscription.trialExpiring": "Tu periodo de prueba está por vencer",
    "subscription.daysRemaining": "días restantes",
    "subscription.oneDay": "¡Solo queda 1 día!",
    "subscription.subscribeNow": "Suscribirme ahora",
    "subscription.upgradePrompt": "Suscríbete para continuar disfrutando de todas las funciones",
    
    // Demo
    "demo.badge": "Demo interactiva",
    "demo.title": "Descubre cómo funciona",
    "demo.subtitle": "Sigue el flujo completo desde tu registro hasta tu primer plan de comidas personalizado",
    "demo.startDemo": "Iniciar Demo",
    "demo.restart": "Reiniciar Demo",
    "demo.step1Title": "Paso 1: Bienvenida",
    "demo.step1Desc": "Comenzamos conociendo tus objetivos",
    "demo.step2Title": "Paso 2: Preferencias",
    "demo.step2Desc": "Personalizamos tu experiencia",
    "demo.step3Title": "Paso 3: Generación IA",
    "demo.step3Desc": "Creamos tu plan personalizado",
    "demo.step4Title": "Paso 4: Tu Dashboard",
    "demo.step4Desc": "Accede a tu plan y características",
    
    // Achievement Unlock
    "achievementUnlock.unlocked": "¡Logro Desbloqueado!",
    "achievementUnlock.earned": "Has ganado",
    "achievementUnlock.clickToContinue": "Haz clic para continuar",
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
    "contact.form.title": "Send us a message",
    "contact.form.subtitle": "Fill out the form and we'll respond as soon as possible",
    "contact.form.name": "Full name",
    "contact.form.email": "Email address",
    "contact.form.subject": "Subject",
    "contact.form.message": "Message",
    "contact.form.submit": "Send message",
    "contact.form.success": "Message sent!",
    "contact.form.successDesc": "Thank you for contacting us. We'll review your message and respond soon.",
    "contact.form.sendAnother": "Send another message",
    "contact.form.error": "Error sending message",
    "contact.form.errorDesc": "Please try again later.",
    "contact.validation.nameRequired": "Name is required",
    "contact.validation.nameMax": "Name must be at most 100 characters",
    "contact.validation.emailInvalid": "Invalid email",
    "contact.validation.emailMax": "Email must be at most 255 characters",
    "contact.validation.subjectRequired": "Subject is required",
    "contact.validation.subjectMax": "Subject must be at most 200 characters",
    "contact.validation.messageMin": "Message must be at least 10 characters",
    "contact.validation.messageMax": "Message must be at most 2000 characters",
    
    // Auth
    "auth.welcome": "Welcome to",
    "auth.subtitle": "Your AI nutrition coach",
    "auth.login": "Log In",
    "auth.signup": "Create Account",
    "auth.email": "Email address",
    "auth.password": "Password",
    "auth.accountCreated": "Account created!",
    "auth.accountCreatedDesc": "Welcome to Chefly.AI. Let's set up your preferences.",
    "auth.welcomeBack": "Welcome back!",
    "auth.welcomeBackDesc": "Logging in...",
    "auth.error": "Error",
    "auth.loginError": "Login error",
    "auth.invalidEmail": "Invalid email address",
    "auth.invalidPassword": "Invalid password",
    "auth.passwordLength": "Password must be between 8 and 128 characters",
    "auth.backToHome": "Back to home",
    
    // FAQ
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Find answers to the most common questions about Chefly.AI",
    "faq.backToHome": "Back to home",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.finish": "Finish",
    
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
    
    // Dashboard
    "dashboard.days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "dashboard.meals.breakfast": "Breakfast",
    "dashboard.meals.lunch": "Lunch",
    "dashboard.meals.dinner": "Dinner",
    "dashboard.welcome": "Welcome back!",
    "dashboard.welcomeMessage": "Here's your weekly nutrition plan",
    "dashboard.trialExpired": "Your trial period has ended",
    "dashboard.trialExpiredDesc": "Subscribe to continue using Chefly.AI",
    "dashboard.subscribe": "Subscribe now",
    "dashboard.stats": "Your Stats",
    "dashboard.level": "Level",
    "dashboard.totalPoints": "Total Points",
    "dashboard.currentStreak": "Current Streak",
    "dashboard.longestStreak": "Longest Streak",
    "dashboard.mealsCompleted": "Meals Completed",
    "dashboard.days_one": "day",
    "dashboard.days_other": "days",
    "dashboard.weeklyPlan": "Weekly Plan",
    "dashboard.generateNew": "Generate New Plan",
    "dashboard.generating": "Generating personalized plan...",
    "dashboard.aiThinking": "AI is creating your perfect menu",
    "dashboard.noMealPlan": "You don't have a meal plan yet",
    "dashboard.createFirst": "Create your first personalized plan",
    "dashboard.generatePlan": "Generate Plan",
    "dashboard.noPreferences": "Set up your preferences first",
    "dashboard.setupPreferences": "Setup Preferences",
    "dashboard.todaySummary": "Today's Summary",
    "dashboard.completedMeals": "Completed Meals",
    "dashboard.viewSummary": "View Day Summary",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.chatCoach": "Chat with AI Coach",
    "dashboard.viewProgress": "View Progress",
    "dashboard.editPreferences": "Edit Preferences",
    "dashboard.trendingUp": "Trending up",
    "dashboard.errorGenerate": "Error generating plan",
    "dashboard.tryAgain": "Please try again later",
    "dashboard.planGenerated": "Plan generated!",
    "dashboard.planReady": "Your weekly plan is ready",
    "dashboard.mealCompleted": "Meal completed!",
    "dashboard.pointsEarned": "You earned {{points}} points",
    "dashboard.keepStreak": "Keep your streak active",
    "dashboard.errorComplete": "Error completing meal",
    "dashboard.unlocked": "Unlocked",
    "dashboard.viewDetails": "View details",
    "dashboard.swapMeal": "Swap meal",
    "dashboard.markComplete": "Mark as completed",
    "dashboard.completed": "Completed",
    "dashboard.limitReached": "Limit reached",
    "dashboard.limitReachedDesc": "You've reached the limit of {{limit}} monthly plans. Upgrade to Intermediate plan for unlimited plans.",
    "dashboard.upgradePlan": "Upgrade Plan",
    
    // Onboarding
    "onboarding.step": "Step {{current}} of {{total}}",
    "onboarding.basicInfo": "Basic Information",
    "onboarding.goal": "What is your main goal?",
    "onboarding.goalDesc": "This will help us personalize your plan",
    "onboarding.goals.lose_fat": "Lose fat",
    "onboarding.goals.gain_muscle": "Gain muscle",
    "onboarding.goals.eat_healthy": "Eat healthy",
    "onboarding.goals.save_money": "Save money",
    "onboarding.dietType": "What type of diet do you follow?",
    "onboarding.diets.omnivore": "Omnivore",
    "onboarding.diets.vegetarian": "Vegetarian",
    "onboarding.diets.vegan": "Vegan",
    "onboarding.diets.keto": "Keto",
    "onboarding.diets.paleo": "Paleo",
    "onboarding.mealsPerDay": "How many meals do you prefer per day?",
    "onboarding.allergies": "Food allergies or restrictions",
    "onboarding.allergiesDesc": "Optional - press Enter to add",
    "onboarding.allergiesPlaceholder": "E.g: nuts, dairy, gluten",
    "onboarding.personalPreferences": "Personal Preferences",
    "onboarding.cookingSkill": "Cooking skill level",
    "onboarding.skills.beginner": "Beginner - Simple recipes",
    "onboarding.skills.intermediate": "Intermediate - Can follow most recipes",
    "onboarding.skills.advanced": "Advanced - Enjoy cooking complex dishes",
    "onboarding.budget": "Food budget",
    "onboarding.budgets.low": "Low - Budget ingredients",
    "onboarding.budgets.medium": "Medium - Balance between price and quality",
    "onboarding.budgets.high": "High - Premium ingredients",
    "onboarding.cookingTime": "Available cooking time (minutes)",
    "onboarding.servings": "Number of servings per meal",
    "onboarding.dislikes": "Ingredients you don't like",
    "onboarding.dislikesDesc": "Optional - press Enter to add",
    "onboarding.dislikesPlaceholder": "E.g: broccoli, fish",
    "onboarding.flavorPreferences": "Flavor preferences",
    "onboarding.flavorDesc": "Select your favorite flavors",
    "onboarding.flavors": ["Sweet", "Salty", "Spicy", "Sour", "Umami", "Bitter"],
    "onboarding.additionalInfo": "Additional Information",
    "onboarding.mealComplexity": "Preferred recipe complexity",
    "onboarding.complexity.simple": "Simple - Few steps and ingredients",
    "onboarding.complexity.moderate": "Moderate - Standard recipes",
    "onboarding.complexity.complex": "Complex - Elaborate recipes",
    "onboarding.cuisines": "Preferred cuisine types",
    "onboarding.cuisinesList": ["Mexican", "Italian", "Asian", "Mediterranean", "American", "Vegetarian", "Healthy"],
    "onboarding.activityLevel": "Physical activity level",
    "onboarding.activities.sedentary": "Sedentary - Little or no exercise",
    "onboarding.activities.light": "Light - Exercise 1-2 days/week",
    "onboarding.activities.moderate": "Moderate - Exercise 3-5 days/week",
    "onboarding.activities.active": "Active - Exercise 6-7 days/week",
    "onboarding.activities.very_active": "Very active - Intense daily exercise",
    "onboarding.demographics": "Demographic information (optional)",
    "onboarding.age": "Age",
    "onboarding.weight": "Weight (kg)",
    "onboarding.gender": "Gender",
    "onboarding.genders.male": "Male",
    "onboarding.genders.female": "Female",
    "onboarding.genders.other": "Other",
    "onboarding.genders.prefer_not": "Prefer not to say",
    "onboarding.additionalNotes": "Additional notes",
    "onboarding.notesPlaceholder": "Any other information you'd like to share about your nutritional preferences...",
    "onboarding.inputTooLong": "Input too long",
    "onboarding.inputTooLongDesc": "Input cannot be more than 100 characters",
    "onboarding.errorSaving": "Error saving preferences",
    "onboarding.errorSavingDesc": "Please try again",
    "onboarding.preferencesSaved": "Preferences saved!",
    "onboarding.redirecting": "Redirecting to your dashboard...",
    
    // Chat
    "chat.title": "AI Nutrition Coach",
    "chat.backToDashboard": "Back to Dashboard",
    "chat.placeholder": "Type your nutrition question...",
    "chat.send": "Send",
    "chat.limitReached": "Message limit reached",
    "chat.limitReachedDesc": "You've reached the limit of {{limit}} daily messages on the Basic plan. Upgrade to Intermediate plan for unlimited chat.",
    "chat.messagesUsed": "Messages used today",
    "chat.messagesLimit": "of {{limit}} daily",
    "chat.unlimited": "unlimited",
    "chat.welcome": "Hello! I'm your AI nutrition coach. How can I help you today?",
    "chat.errorSending": "Error sending message",
    "chat.errorSendingDesc": "Please try again",
    
    // Privacy & Terms
    "privacy.title": "Privacy Policy",
    "privacy.lastUpdated": "Last updated",
    "privacy.back": "Back",
    "terms.title": "Terms and Conditions",
    "terms.lastUpdated": "Last updated",
    "terms.back": "Back",
    
    // NotFound
    "notfound.title": "404",
    "notfound.heading": "Page not found",
    "notfound.message": "Sorry, the page you're looking for doesn't exist or has been moved.",
    "notfound.goBack": "Go back",
    "notfound.goHome": "Go home",
    
    // Meal Detail
    "mealDetail.nutritionalInfo": "Nutritional Information",
    "mealDetail.calories": "Calories",
    "mealDetail.protein": "Protein",
    "mealDetail.carbs": "Carbohydrates",
    "mealDetail.fats": "Fats",
    "mealDetail.benefits": "Benefits",
    "mealDetail.ingredients": "Ingredients",
    "mealDetail.steps": "Cooking Steps",
    "mealDetail.swapMeal": "Swap meal",
    "mealDetail.lockedMessage": "You need to be subscribed to swap meals",
    
    // Swap Meal
    "swapMeal.title": "Swap meal",
    "swapMeal.description": "Select which meal you want to swap with",
    
    // Challenges
    "challenges.title": "Daily Challenges",
    "challenges.subtitle": "Complete challenges to earn extra points",
    "challenges.noChallenges": "No active challenges",
    "challenges.generateNew": "Generate new challenges",
    "challenges.generating": "Generating...",
    "challenges.errorLoading": "Could not load challenges",
    "challenges.errorGenerating": "Could not generate challenges",
    "challenges.challengesGenerated": "Challenges generated!",
    "challenges.newChallenges": "You have 3 new daily challenges",
    "challenges.complete": "Complete",
    "challenges.completed": "Completed!",
    "challenges.progress": "Progress",
    "challenges.reward": "Reward",
    "challenges.bonus": "Bonus",
    "challenges.points": "points",
    
    // Achievements
    "achievements.title": "Achievements and Badges",
    "achievements.subtitle": "Unlock badges by completing challenges",
    "achievements.unlocked": "Unlocked",
    "achievements.points": "pts",
    
    // Nutrition Charts
    "nutritionCharts.title": "Nutritional Progress",
    "nutritionCharts.subtitle": "Visualize your evolution over time",
    "nutritionCharts.weekly": "Weekly (28 days)",
    "nutritionCharts.monthly": "Monthly (12 weeks)",
    "nutritionCharts.calories": "Calories",
    "nutritionCharts.protein": "Protein",
    "nutritionCharts.carbs": "Carbohydrates",
    "nutritionCharts.fats": "Fats",
    "nutritionCharts.mealsCompleted": "Meals Completed",
    "nutritionCharts.noData": "No data available yet. Complete meals to see your progress.",
    
    // Confirm Plan
    "confirmPlan.title": "Generate new weekly plan?",
    "confirmPlan.description": "This will replace your current plan. Choose how you want to generate your new menu:",
    "confirmPlan.cached": "Use existing menu (Recommended)",
    "confirmPlan.cachedDesc": "Reuse a menu with your same preferences. Doesn't consume AI credits. ✨",
    "confirmPlan.new": "Generate completely new menu",
    "confirmPlan.newDesc": "Create a unique menu with AI. Consumes Lovable AI credits. 🤖",
    "confirmPlan.cancel": "Cancel",
    "confirmPlan.generate": "Generate plan",
    "confirmPlan.generating": "Generating...",
    
    // Daily Summary
    "dailySummary.title": "Day Completed!",
    "dailySummary.subtitle": "Nutritional summary for",
    "dailySummary.congrats": "Excellent work completing all your meals for the day!",
    "dailySummary.totalCalories": "Total Calories",
    "dailySummary.kcal": "kcal",
    "dailySummary.proteins": "Protein",
    "dailySummary.carbohydrates": "Carbohydrates",
    "dailySummary.fats": "Fats",
    "dailySummary.motivational": "Keep up this pace to reach your health goals 💪",
    
    // Subscription Banner
    "subscription.activePlan": "Plan",
    "subscription.active": "Active",
    "subscription.managePlan": "Manage plan",
    "subscription.enjoyBenefits": "Enjoy all the benefits of your plan",
    "subscription.trialExpiring": "Your trial period is about to expire",
    "subscription.daysRemaining": "days remaining",
    "subscription.oneDay": "Only 1 day left!",
    "subscription.subscribeNow": "Subscribe now",
    "subscription.upgradePrompt": "Subscribe to continue enjoying all features",
    
    // Demo
    "demo.badge": "Interactive demo",
    "demo.title": "Discover how it works",
    "demo.subtitle": "Follow the complete flow from your signup to your first personalized meal plan",
    "demo.startDemo": "Start Demo",
    "demo.restart": "Restart Demo",
    "demo.step1Title": "Step 1: Welcome",
    "demo.step1Desc": "We start by learning your goals",
    "demo.step2Title": "Step 2: Preferences",
    "demo.step2Desc": "We personalize your experience",
    "demo.step3Title": "Step 3: AI Generation",
    "demo.step3Desc": "We create your personalized plan",
    "demo.step4Title": "Step 4: Your Dashboard",
    "demo.step4Desc": "Access your plan and features",
    
    // Achievement Unlock
    "achievementUnlock.unlocked": "Achievement Unlocked!",
    "achievementUnlock.earned": "You have earned",
    "achievementUnlock.clickToContinue": "Click to continue",
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
    const value = translations[language][key as keyof typeof translations.es];
    return Array.isArray(value) ? key : (value || key);
  };

  const getArray = (key: string): string[] => {
    const value = translations[language][key as keyof typeof translations.es];
    return Array.isArray(value) ? value : [];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getArray }}>
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
