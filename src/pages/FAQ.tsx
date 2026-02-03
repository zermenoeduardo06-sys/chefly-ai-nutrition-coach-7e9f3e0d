import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const FAQ = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const faqCategories = [
    {
      category: language === "es" ? "General" : "General",
      questions: [
        {
          question: language === "es" ? "¿Qué es Chefly.AI?" : "What is Chefly.AI?",
          answer: language === "es" 
            ? "Chefly.AI es tu entrenador alimenticio personal con inteligencia artificial. Genera menús semanales personalizados basados en tus objetivos, preferencias y estilo de vida. Además, incluye un coach virtual con el que puedes chatear para resolver dudas nutricionales."
            : "Chefly.AI is your personal AI-powered nutrition coach. It generates personalized weekly menus based on your goals, preferences, and lifestyle. It also includes a virtual coach you can chat with to resolve nutritional questions."
        },
        {
          question: language === "es" ? "¿Cómo funciona la IA?" : "How does the AI work?",
          answer: language === "es"
            ? "Nuestra inteligencia artificial analiza tu información personal (objetivos, alergias, preferencias, nivel de actividad, etc.) y crea planes de comida totalmente personalizados. El sistema aprende de tus interacciones y va mejorando las recomendaciones con el tiempo."
            : "Our artificial intelligence analyzes your personal information (goals, allergies, preferences, activity level, etc.) and creates fully personalized meal plans. The system learns from your interactions and improves recommendations over time."
        },
        {
          question: language === "es" ? "¿Necesito conocimientos de nutrición?" : "Do I need nutrition knowledge?",
          answer: language === "es"
            ? "¡Para nada! Chefly.AI está diseñado para ser simple y fácil de usar. Solo responde algunas preguntas sobre ti y nosotros nos encargamos del resto. Cada receta incluye instrucciones paso a paso."
            : "Not at all! Chefly.AI is designed to be simple and easy to use. Just answer a few questions about yourself and we'll take care of the rest. Each recipe includes step-by-step instructions."
        }
      ]
    },
    {
      category: language === "es" ? "Planes y Precios" : "Plans and Pricing",
      questions: [
        {
          question: language === "es" ? "¿Cuánto cuesta Chefly.AI?" : "How much does Chefly.AI cost?",
          answer: language === "es"
            ? "Ofrecemos Chefly Plus a $7.99 USD/mes. Los nuevos usuarios pueden acceder a un período de prueba de 3 días al iniciar la suscripción a través de Apple. Puedes ver los detalles completos en nuestra página de precios."
            : "We offer Chefly Plus at $7.99 USD/month. New users can access a 3-day free trial when starting a subscription through Apple. You can see full details on our pricing page."
        },
        {
          question: language === "es" ? "¿Puedo cancelar cuando quiera?" : "Can I cancel anytime?",
          answer: language === "es"
            ? "Sí, absolutamente. No hay contratos ni compromisos a largo plazo. Puedes cancelar tu suscripción en cualquier momento desde tu cuenta y no se te cobrará en el siguiente período."
            : "Yes, absolutely. There are no contracts or long-term commitments. You can cancel your subscription at any time from your account and you won't be charged for the next period."
        },
        {
          question: language === "es" ? "¿Qué incluye la prueba gratis?" : "What does the free trial include?",
          answer: language === "es"
            ? "Durante los 3 días de prueba tendrás acceso completo a todas las funciones premium: generación de menús personalizados ilimitados, lista de compras, chat con el coach nutricional, escáner de comida con IA y más. Se requiere método de pago a través de Apple para activar la prueba."
            : "During the 3-day trial you'll have full access to all premium features: unlimited personalized menu generation, shopping list, chat with the nutrition coach, AI food scanner, and more. Payment method through Apple is required to activate the trial."
        },
        {
          question: language === "es" ? "¿Ofrecen reembolsos?" : "Do you offer refunds?",
          answer: language === "es"
            ? "Los reembolsos de suscripciones de Apple se gestionan directamente a través de Apple. Puedes solicitar un reembolso visitando reportaproblem.apple.com. Si tienes algún problema con tu suscripción, contáctanos y haremos lo posible por ayudarte."
            : "Refunds for Apple subscriptions are handled directly through Apple. You can request a refund by visiting reportaproblem.apple.com. If you have any issues with your subscription, contact us and we'll do our best to help."
        }
      ]
    },
    {
      category: language === "es" ? "Menús y Recetas" : "Menus and Recipes",
      questions: [
        {
          question: language === "es" ? "¿Puedo personalizar mis menús?" : "Can I customize my menus?",
          answer: language === "es"
            ? "¡Por supuesto! Puedes especificar tus alergias, alimentos que no te gustan, preferencias de cocina (mexicana, mediterránea, etc.), nivel de habilidad en la cocina, presupuesto y mucho más. También puedes intercambiar cualquier comida que no te guste."
            : "Of course! You can specify your allergies, foods you don't like, cuisine preferences (Mexican, Mediterranean, etc.), cooking skill level, budget, and much more. You can also swap any meal you don't like."
        },
        {
          question: language === "es" ? "¿Con qué frecuencia recibo nuevos menús?" : "How often do I receive new menus?",
          answer: language === "es"
            ? "Generas nuevos menús semanales cuando tú quieras. Puedes crear un menú nuevo cada semana o mantener uno que te guste por más tiempo. Tú tienes el control."
            : "You generate new weekly menus whenever you want. You can create a new menu each week or keep one you like for longer. You're in control."
        },
        {
          question: language === "es" ? "¿Las recetas son difíciles de preparar?" : "Are the recipes difficult to prepare?",
          answer: language === "es"
            ? "No, diseñamos recetas para todos los niveles. Durante el onboarding puedes indicar tu nivel de habilidad en la cocina y el tiempo que tienes disponible. Las recetas se adaptan a tu situación e incluyen instrucciones detalladas."
            : "No, we design recipes for all levels. During onboarding you can indicate your cooking skill level and available time. Recipes adapt to your situation and include detailed instructions."
        },
        {
          question: language === "es" ? "¿Incluye lista de compras?" : "Does it include a shopping list?",
          answer: language === "es"
            ? "Sí, cada menú semanal viene con una lista de compras automática organizada por categorías. Solo imprímela o llévala en tu teléfono al supermercado."
            : "Yes, each weekly menu comes with an automatic shopping list organized by categories. Just print it or take it on your phone to the supermarket."
        }
      ]
    },
    {
      category: language === "es" ? "Objetivos y Resultados" : "Goals and Results",
      questions: [
        {
          question: language === "es" ? "¿Puedo usar Chefly.AI para bajar de peso?" : "Can I use Chefly.AI to lose weight?",
          answer: language === "es"
            ? "Sí, Chefly.AI es excelente para pérdida de peso. El sistema calcula tus necesidades calóricas y crea menús balanceados para ayudarte a alcanzar tu objetivo de forma saludable y sostenible."
            : "Yes, Chefly.AI is excellent for weight loss. The system calculates your caloric needs and creates balanced menus to help you reach your goal in a healthy and sustainable way."
        },
        {
          question: language === "es" ? "¿Sirve para ganar masa muscular?" : "Does it work for muscle gain?",
          answer: language === "es"
            ? "¡Definitivamente! Si tu objetivo es ganar músculo, la IA creará menús altos en proteína y calorías apropiadas para apoyar tu entrenamiento y crecimiento muscular."
            : "Definitely! If your goal is muscle gain, the AI will create high-protein menus with appropriate calories to support your training and muscle growth."
        },
        {
          question: language === "es" ? "¿Cuánto tiempo toma ver resultados?" : "How long does it take to see results?",
          answer: language === "es"
            ? "Los resultados varían según la persona y sus objetivos, pero muchos usuarios reportan sentirse mejor en las primeras semanas. Para cambios físicos notables como pérdida de peso o ganancia muscular, típicamente se ven resultados en 4-8 semanas con consistencia."
            : "Results vary depending on the person and their goals, but many users report feeling better in the first weeks. For noticeable physical changes like weight loss or muscle gain, results are typically seen in 4-8 weeks with consistency."
        },
        {
          question: language === "es" ? "¿Es apto para personas con diabetes u otras condiciones?" : "Is it suitable for people with diabetes or other conditions?",
          answer: language === "es"
            ? "Chefly.AI puede ayudar a crear menús saludables, pero no es un sustituto del consejo médico profesional. Si tienes una condición médica, consulta con tu doctor antes de hacer cambios significativos en tu dieta."
            : "Chefly.AI can help create healthy menus, but it's not a substitute for professional medical advice. If you have a medical condition, consult with your doctor before making significant changes to your diet."
        }
      ]
    },
    {
      category: language === "es" ? "Soporte y Ayuda" : "Support and Help",
      questions: [
        {
          question: language === "es" ? "¿Cómo funciona el chat con el coach nutricional?" : "How does the nutrition coach chat work?",
          answer: language === "es"
            ? "El coach nutricional es un asistente con IA disponible 24/7 para responder tus preguntas sobre nutrición, recetas, sustituciones de ingredientes, consejos de preparación y más. Es como tener un nutriólogo personal en tu bolsillo."
            : "The nutrition coach is an AI assistant available 24/7 to answer your questions about nutrition, recipes, ingredient substitutions, preparation tips, and more. It's like having a personal nutritionist in your pocket."
        },
        {
          question: language === "es" ? "¿Qué hago si tengo problemas técnicos?" : "What do I do if I have technical problems?",
          answer: language === "es"
            ? "Puedes contactarnos desde la sección de Contáctanos en Configuración. Nuestro equipo de soporte está disponible para ayudarte con cualquier problema técnico o duda que tengas."
            : "You can contact us from the Contact Us section in Settings. Our support team is available to help you with any technical problems or questions you have."
        },
        {
          question: language === "es" ? "¿Mis datos están seguros?" : "Is my data secure?",
          answer: language === "es"
            ? "Absolutamente. Tomamos la seguridad muy en serio. Todos tus datos están encriptados y protegidos. Nunca compartimos tu información personal con terceros. Puedes leer más en nuestra Política de Privacidad."
            : "Absolutely. We take security very seriously. All your data is encrypted and protected. We never share your personal information with third parties. You can read more in our Privacy Policy."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background border-b border-border pt-safe-top"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {language === "es" ? "Preguntas Frecuentes" : "FAQ"}
          </h1>
          <div className="w-10" />
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-4 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === "es" ? "¿Cómo podemos ayudarte?" : "How can we help you?"}
        </h2>
        <p className="text-muted-foreground">
          {language === "es" 
            ? "Encuentra respuestas a las dudas más comunes" 
            : "Find answers to the most common questions"}
        </p>
      </motion.div>

      {/* FAQ Accordion */}
      <div className="px-4 space-y-4">
        {faqCategories.map((category, categoryIndex) => (
          <motion.div
            key={categoryIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-4">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                  {category.category}
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`item-${categoryIndex}-${index}`}
                      className="border-border/50"
                    >
                      <AccordionTrigger className="text-left text-sm hover:text-primary transition-colors py-3">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-3">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-4 mt-6"
      >
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-4 text-center">
            <h3 className="text-lg font-bold mb-2">
              {language === "es" ? "¿No encontraste tu respuesta?" : "Didn't find your answer?"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "es" 
                ? "Contáctanos desde Configuración" 
                : "Contact us from Settings"}
            </p>
            <Button
              variant="default"
              onClick={() => navigate("/dashboard/settings/contact")}
              className="w-full"
            >
              {language === "es" ? "Ir a Contacto" : "Go to Contact"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FAQ;
