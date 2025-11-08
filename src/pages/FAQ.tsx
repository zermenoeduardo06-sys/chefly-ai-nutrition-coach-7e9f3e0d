import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChefHat, ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const FAQ = () => {
  const navigate = useNavigate();

  const faqCategories = [
    {
      category: "General",
      questions: [
        {
          question: "¿Qué es Chefly.AI?",
          answer: "Chefly.AI es tu entrenador alimenticio personal con inteligencia artificial. Genera menús semanales personalizados basados en tus objetivos, preferencias y estilo de vida. Además, incluye un coach virtual con el que puedes chatear para resolver dudas nutricionales."
        },
        {
          question: "¿Cómo funciona la IA?",
          answer: "Nuestra inteligencia artificial analiza tu información personal (objetivos, alergias, preferencias, nivel de actividad, etc.) y crea planes de comida totalmente personalizados. El sistema aprende de tus interacciones y va mejorando las recomendaciones con el tiempo."
        },
        {
          question: "¿Necesito conocimientos de nutrición?",
          answer: "¡Para nada! Chefly.AI está diseñado para ser simple y fácil de usar. Solo responde algunas preguntas sobre ti y nosotros nos encargamos del resto. Cada receta incluye instrucciones paso a paso."
        }
      ]
    },
    {
      category: "Planes y Precios",
      questions: [
        {
          question: "¿Cuánto cuesta Chefly.AI?",
          answer: "Ofrecemos varios planes desde $199 MXN/mes. Todos los planes incluyen 4 días de prueba gratis sin necesidad de tarjeta de crédito. Puedes ver los detalles completos en nuestra página de precios."
        },
        {
          question: "¿Puedo cancelar cuando quiera?",
          answer: "Sí, absolutamente. No hay contratos ni compromisos a largo plazo. Puedes cancelar tu suscripción en cualquier momento desde tu cuenta y no se te cobrará en el siguiente período."
        },
        {
          question: "¿Qué incluye la prueba gratis?",
          answer: "Durante los 4 días de prueba gratis tendrás acceso completo a todas las funciones: generación de menús personalizados, lista de compras, chat con el coach nutricional, seguimiento de progreso y más. No necesitas ingresar datos de tarjeta para comenzar."
        },
        {
          question: "¿Ofrecen reembolsos?",
          answer: "Sí, ofrecemos garantía de satisfacción de 7 días. Si no estás satisfecho con el servicio, contáctanos y te reembolsaremos tu dinero sin hacer preguntas."
        }
      ]
    },
    {
      category: "Menús y Recetas",
      questions: [
        {
          question: "¿Puedo personalizar mis menús?",
          answer: "¡Por supuesto! Puedes especificar tus alergias, alimentos que no te gustan, preferencias de cocina (mexicana, mediterránea, etc.), nivel de habilidad en la cocina, presupuesto y mucho más. También puedes intercambiar cualquier comida que no te guste."
        },
        {
          question: "¿Con qué frecuencia recibo nuevos menús?",
          answer: "Generas nuevos menús semanales cuando tú quieras. Puedes crear un menú nuevo cada semana o mantener uno que te guste por más tiempo. Tú tienes el control."
        },
        {
          question: "¿Las recetas son difíciles de preparar?",
          answer: "No, diseñamos recetas para todos los niveles. Durante el onboarding puedes indicar tu nivel de habilidad en la cocina y el tiempo que tienes disponible. Las recetas se adaptan a tu situación e incluyen instrucciones detalladas."
        },
        {
          question: "¿Incluye lista de compras?",
          answer: "Sí, cada menú semanal viene con una lista de compras automática organizada por categorías. Solo imprímela o llévala en tu teléfono al supermercado."
        }
      ]
    },
    {
      category: "Objetivos y Resultados",
      questions: [
        {
          question: "¿Puedo usar Chefly.AI para bajar de peso?",
          answer: "Sí, Chefly.AI es excelente para pérdida de peso. El sistema calcula tus necesidades calóricas y crea menús balanceados para ayudarte a alcanzar tu objetivo de forma saludable y sostenible."
        },
        {
          question: "¿Sirve para ganar masa muscular?",
          answer: "¡Definitivamente! Si tu objetivo es ganar músculo, la IA creará menús altos en proteína y calorías apropiadas para apoyar tu entrenamiento y crecimiento muscular."
        },
        {
          question: "¿Cuánto tiempo toma ver resultados?",
          answer: "Los resultados varían según la persona y sus objetivos, pero muchos usuarios reportan sentirse mejor en las primeras semanas. Para cambios físicos notables como pérdida de peso o ganancia muscular, típicamente se ven resultados en 4-8 semanas con consistencia."
        },
        {
          question: "¿Es apto para personas con diabetes u otras condiciones?",
          answer: "Chefly.AI puede ayudar a crear menús saludables, pero no es un sustituto del consejo médico profesional. Si tienes una condición médica, consulta con tu doctor antes de hacer cambios significativos en tu dieta."
        }
      ]
    },
    {
      category: "Soporte y Ayuda",
      questions: [
        {
          question: "¿Cómo funciona el chat con el coach nutricional?",
          answer: "El coach nutricional es un asistente con IA disponible 24/7 para responder tus preguntas sobre nutrición, recetas, sustituciones de ingredientes, consejos de preparación y más. Es como tener un nutriólogo personal en tu bolsillo."
        },
        {
          question: "¿Qué hago si tengo problemas técnicos?",
          answer: "Puedes contactarnos por WhatsApp al +52 871 218 5196 o por teléfono. Nuestro equipo de soporte está disponible para ayudarte con cualquier problema técnico o duda que tengas."
        },
        {
          question: "¿Puedo usar Chefly.AI en mi teléfono?",
          answer: "Sí, Chefly.AI funciona perfectamente en cualquier dispositivo: teléfono, tablet o computadora. La interfaz es completamente responsive y optimizada para uso móvil."
        },
        {
          question: "¿Mis datos están seguros?",
          answer: "Absolutamente. Tomamos la seguridad muy en serio. Todos tus datos están encriptados y protegidos. Nunca compartimos tu información personal con terceros. Puedes leer más en nuestra Política de Privacidad."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ChefHat className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">Chefly AI</span>
          </button>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Iniciar sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>

          <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Preguntas{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Frecuentes
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Encuentra respuestas a las dudas más comunes sobre Chefly.AI
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-4xl mx-auto space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                    {category.category}
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                        <AccordionTrigger className="text-left hover:text-primary transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto mt-16 text-center space-y-6 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 border border-primary/20">
            <h2 className="text-3xl font-bold">¿No encontraste tu respuesta?</h2>
            <p className="text-lg text-muted-foreground">
              Contáctanos directamente y con gusto te ayudaremos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="lg"
                onClick={() => navigate("/")}
                className="text-lg px-8 py-6 h-auto"
              >
                Contactar Soporte
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6 h-auto"
              >
                Comenzar prueba gratis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 bg-muted/30 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Chefly AI. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;
