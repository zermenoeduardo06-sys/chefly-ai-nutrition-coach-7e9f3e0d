import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const termsContent = {
  es: {
    sections: [
      {
        title: "1. Aceptación de los Términos",
        content: "Al acceder y utilizar Chefly AI Nutrition Coach (\"la Aplicación\", \"nosotros\", \"nuestro\"), usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestra aplicación."
      },
      {
        title: "2. Descripción del Servicio",
        intro: "Chefly AI Nutrition Coach es una aplicación web que proporciona:",
        list: [
          "Planes de comidas personalizados generados por inteligencia artificial",
          "Recomendaciones nutricionales basadas en sus objetivos y preferencias",
          "Seguimiento de progreso nutricional y logros",
          "Chat con coach de nutrición con IA",
          "Desafíos diarios y sistema de gamificación",
          "Listas de compras automatizadas"
        ]
      },
      {
        title: "3. Registro de Cuenta",
        subsections: [
          {
            subtitle: "3.1 Elegibilidad",
            content: "Debe tener al menos 13 años de edad para usar esta aplicación. Si es menor de 18 años, debe tener el consentimiento de un padre o tutor legal."
          },
          {
            subtitle: "3.2 Información de Cuenta",
            intro: "Usted es responsable de:",
            list: [
              "Proporcionar información precisa y actualizada",
              "Mantener la confidencialidad de su contraseña",
              "Notificarnos inmediatamente sobre cualquier uso no autorizado",
              "Todas las actividades que ocurran bajo su cuenta"
            ]
          }
        ]
      },
      {
        title: "4. Descargo de Responsabilidad Médica",
        isWarning: true,
        warningTitle: "⚠️ IMPORTANTE: DESCARGO DE RESPONSABILIDAD MÉDICA",
        list: [
          "Esta aplicación NO proporciona asesoramiento médico, diagnóstico o tratamiento",
          "Los planes de comidas son generados por IA y son solo para fines informativos",
          "Siempre consulte con un profesional de la salud antes de hacer cambios dietéticos significativos",
          "Si tiene condiciones médicas, alergias graves o necesidades dietéticas especiales, consulte con un nutricionista o médico certificado",
          "No somos responsables de reacciones adversas, alergias o problemas de salud derivados del uso de nuestras recomendaciones",
          "Esta aplicación no reemplaza el consejo médico profesional"
        ]
      },
      {
        title: "5. Planes de Suscripción y Pagos",
        subsections: [
          {
            subtitle: "5.1 Planes Disponibles",
            content: "Ofrecemos Chefly Plus, nuestra suscripción premium con acceso completo a todas las funciones. Los detalles están disponibles en la aplicación."
          },
          {
            subtitle: "5.2 Período de Prueba",
            content: "Los nuevos usuarios pueden acceder a un período de prueba gratuito de 3 días al iniciar una suscripción. La prueba requiere proporcionar un método de pago válido a través de Apple. Si no se cancela al menos 24 horas antes del final del período de prueba, la suscripción se activará automáticamente con el cargo correspondiente."
          },
          {
            subtitle: "5.3 Facturación",
            list: [
              "Los pagos se procesan de forma segura a través de Apple In-App Purchase",
              "Las suscripciones se renuevan automáticamente cada mes",
              "Los precios están en dólares estadounidenses (USD)",
              "Puede cancelar su suscripción en cualquier momento desde Configuración > Apple ID > Suscripciones en su dispositivo iOS",
              "Para solicitudes de reembolso, contacte directamente a Apple a través de reportaproblem.apple.com"
            ]
          },
          {
            subtitle: "5.4 Cambios de Precio",
            content: "Nos reservamos el derecho de modificar los precios con un aviso previo de 30 días. Los cambios no afectarán su ciclo de facturación actual."
          }
        ]
      },
      {
        title: "6. Uso Aceptable",
        intro: "Usted se compromete a NO:",
        list: [
          "Usar la aplicación para fines ilegales o no autorizados",
          "Intentar acceder a áreas restringidas o datos de otros usuarios",
          "Interferir con el funcionamiento normal de la aplicación",
          "Realizar ingeniería inversa o intentar extraer el código fuente",
          "Transmitir virus, malware o código malicioso",
          "Acosar, abusar o dañar a otros usuarios",
          "Compartir su cuenta con terceros",
          "Usar bots o scripts automatizados",
          "Recopilar información de otros usuarios"
        ]
      },
      {
        title: "7. Propiedad Intelectual",
        subsections: [
          {
            subtitle: "7.1 Nuestra Propiedad",
            content: "Todo el contenido de la aplicación, incluyendo pero no limitado a textos, gráficos, logos, íconos, imágenes, clips de audio, descargas digitales, compilaciones de datos y software, es propiedad de Chefly AI o de sus proveedores de contenido y está protegido por leyes de propiedad intelectual."
          },
          {
            subtitle: "7.2 Su Contenido",
            content: "Usted conserva todos los derechos sobre la información personal que proporciona. Al usar la aplicación, nos otorga una licencia limitada para usar esta información para proporcionar nuestros servicios."
          }
        ]
      },
      {
        title: "8. Limitación de Responsabilidad",
        intro: "En la máxima medida permitida por la ley:",
        list: [
          "La aplicación se proporciona \"tal cual\" sin garantías de ningún tipo",
          "No garantizamos que la aplicación esté libre de errores o ininterrumpida",
          "No somos responsables de daños directos, indirectos, incidentales o consecuentes",
          "No somos responsables de reacciones adversas a alimentos o planes dietéticos",
          "No garantizamos resultados específicos de salud o pérdida de peso",
          "Nuestra responsabilidad total no excederá el monto pagado en los últimos 12 meses"
        ]
      },
      {
        title: "9. Indemnización",
        intro: "Usted acepta indemnizar y mantener indemne a Chefly AI, sus afiliados, empleados y socios de cualquier reclamo, daño, pérdida o gasto (incluyendo honorarios legales) que surja de:",
        list: [
          "Su uso de la aplicación",
          "Su violación de estos Términos",
          "Su violación de derechos de terceros",
          "Consecuencias de salud derivadas del uso de la aplicación"
        ]
      },
      {
        title: "10. Terminación",
        intro: "Podemos suspender o terminar su acceso a la aplicación inmediatamente, sin previo aviso, por cualquier motivo, incluyendo pero no limitado a:",
        list: [
          "Violación de estos Términos",
          "Comportamiento fraudulento o ilegal",
          "Falta de pago",
          "Solicitud del usuario"
        ],
        outro: "Usted puede cancelar su cuenta en cualquier momento desde la configuración de la aplicación."
      },
      {
        title: "11. Modificaciones del Servicio",
        content: "Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto de la aplicación en cualquier momento, con o sin aviso previo. No seremos responsables ante usted o terceros por cualquier modificación, suspensión o discontinuación del servicio."
      },
      {
        title: "12. Ley Aplicable y Jurisdicción",
        content: "Estos Términos se regirán e interpretarán de acuerdo con las leyes de México. Cualquier disputa relacionada con estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales de México."
      },
      {
        title: "13. Disposiciones Generales",
        subsections: [
          {
            subtitle: "13.1 Acuerdo Completo",
            content: "Estos Términos constituyen el acuerdo completo entre usted y Chefly AI respecto al uso de la aplicación."
          },
          {
            subtitle: "13.2 Divisibilidad",
            content: "Si alguna disposición de estos Términos se considera inválida, las disposiciones restantes continuarán en pleno vigor."
          },
          {
            subtitle: "13.3 Renuncia",
            content: "El hecho de que no ejerzamos o hagamos valer algún derecho no constituye una renuncia a dicho derecho."
          }
        ]
      },
      {
        title: "14. Contacto",
        intro: "Para preguntas sobre estos Términos y Condiciones, puede contactarnos en:",
        contact: "chefly.ai.mx@gmail.com"
      }
    ],
    note: "Al continuar usando Chefly AI Nutrition Coach, usted reconoce que ha leído, entendido y aceptado estos Términos y Condiciones en su totalidad."
  },
  en: {
    sections: [
      {
        title: "1. Acceptance of Terms",
        content: "By accessing and using Chefly AI Nutrition Coach (\"the Application\", \"we\", \"our\"), you agree to be legally bound by these Terms and Conditions. If you do not agree with any part of these terms, you should not use our application."
      },
      {
        title: "2. Service Description",
        intro: "Chefly AI Nutrition Coach is a web application that provides:",
        list: [
          "Personalized meal plans generated by artificial intelligence",
          "Nutritional recommendations based on your goals and preferences",
          "Nutritional progress and achievement tracking",
          "AI nutrition coach chat",
          "Daily challenges and gamification system",
          "Automated shopping lists"
        ]
      },
      {
        title: "3. Account Registration",
        subsections: [
          {
            subtitle: "3.1 Eligibility",
            content: "You must be at least 13 years old to use this application. If you are under 18, you must have the consent of a parent or legal guardian."
          },
          {
            subtitle: "3.2 Account Information",
            intro: "You are responsible for:",
            list: [
              "Providing accurate and up-to-date information",
              "Maintaining the confidentiality of your password",
              "Notifying us immediately of any unauthorized use",
              "All activities that occur under your account"
            ]
          }
        ]
      },
      {
        title: "4. Medical Disclaimer",
        isWarning: true,
        warningTitle: "⚠️ IMPORTANT: MEDICAL DISCLAIMER",
        list: [
          "This application does NOT provide medical advice, diagnosis, or treatment",
          "Meal plans are AI-generated and are for informational purposes only",
          "Always consult with a healthcare professional before making significant dietary changes",
          "If you have medical conditions, severe allergies, or special dietary needs, consult with a certified nutritionist or physician",
          "We are not responsible for adverse reactions, allergies, or health problems resulting from using our recommendations",
          "This application does not replace professional medical advice"
        ]
      },
      {
        title: "5. Subscription Plans and Payments",
        subsections: [
          {
            subtitle: "5.1 Available Plans",
            content: "We offer Chefly Plus, our premium subscription with full access to all features. Details are available in the application."
          },
          {
            subtitle: "5.2 Trial Period",
            content: "New users can access a 3-day free trial when starting a subscription. The trial requires providing a valid payment method through Apple. If not cancelled at least 24 hours before the end of the trial period, the subscription will automatically activate with the corresponding charge."
          },
          {
            subtitle: "5.3 Billing",
            list: [
              "Payments are processed securely through Apple In-App Purchase",
              "Subscriptions renew automatically each month",
              "Prices are in US dollars (USD)",
              "You can cancel your subscription at any time from Settings > Apple ID > Subscriptions on your iOS device",
              "For refund requests, contact Apple directly through reportaproblem.apple.com"
            ]
          },
          {
            subtitle: "5.4 Price Changes",
            content: "We reserve the right to modify prices with 30 days prior notice. Changes will not affect your current billing cycle."
          }
        ]
      },
      {
        title: "6. Acceptable Use",
        intro: "You agree NOT to:",
        list: [
          "Use the application for illegal or unauthorized purposes",
          "Attempt to access restricted areas or other users' data",
          "Interfere with the normal operation of the application",
          "Reverse engineer or attempt to extract the source code",
          "Transmit viruses, malware, or malicious code",
          "Harass, abuse, or harm other users",
          "Share your account with third parties",
          "Use bots or automated scripts",
          "Collect information from other users"
        ]
      },
      {
        title: "7. Intellectual Property",
        subsections: [
          {
            subtitle: "7.1 Our Property",
            content: "All content on the application, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, is the property of Chefly AI or its content providers and is protected by intellectual property laws."
          },
          {
            subtitle: "7.2 Your Content",
            content: "You retain all rights to the personal information you provide. By using the application, you grant us a limited license to use this information to provide our services."
          }
        ]
      },
      {
        title: "8. Limitation of Liability",
        intro: "To the maximum extent permitted by law:",
        list: [
          "The application is provided \"as is\" without warranties of any kind",
          "We do not guarantee that the application will be error-free or uninterrupted",
          "We are not liable for direct, indirect, incidental, or consequential damages",
          "We are not responsible for adverse reactions to foods or dietary plans",
          "We do not guarantee specific health or weight loss results",
          "Our total liability will not exceed the amount paid in the last 12 months"
        ]
      },
      {
        title: "9. Indemnification",
        intro: "You agree to indemnify and hold harmless Chefly AI, its affiliates, employees, and partners from any claims, damages, losses, or expenses (including legal fees) arising from:",
        list: [
          "Your use of the application",
          "Your violation of these Terms",
          "Your violation of third-party rights",
          "Health consequences arising from use of the application"
        ]
      },
      {
        title: "10. Termination",
        intro: "We may suspend or terminate your access to the application immediately, without prior notice, for any reason, including but not limited to:",
        list: [
          "Violation of these Terms",
          "Fraudulent or illegal behavior",
          "Non-payment",
          "User request"
        ],
        outro: "You can cancel your account at any time from the application settings."
      },
      {
        title: "11. Service Modifications",
        content: "We reserve the right to modify, suspend, or discontinue any aspect of the application at any time, with or without prior notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the service."
      },
      {
        title: "12. Governing Law and Jurisdiction",
        content: "These Terms shall be governed by and construed in accordance with the laws of Mexico. Any dispute related to these Terms shall be subject to the exclusive jurisdiction of the courts of Mexico."
      },
      {
        title: "13. General Provisions",
        subsections: [
          {
            subtitle: "13.1 Entire Agreement",
            content: "These Terms constitute the entire agreement between you and Chefly AI regarding the use of the application."
          },
          {
            subtitle: "13.2 Severability",
            content: "If any provision of these Terms is found to be invalid, the remaining provisions will continue in full force."
          },
          {
            subtitle: "13.3 Waiver",
            content: "Our failure to exercise or enforce any right does not constitute a waiver of that right."
          }
        ]
      },
      {
        title: "14. Contact",
        intro: "For questions about these Terms and Conditions, you can contact us at:",
        contact: "chefly.ai.mx@gmail.com"
      }
    ],
    note: "By continuing to use Chefly AI Nutrition Coach, you acknowledge that you have read, understood, and accepted these Terms and Conditions in their entirety."
  }
};

const Terms = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const content = termsContent[language as keyof typeof termsContent] || termsContent.es;

  const renderSection = (section: any, index: number) => {
    return (
      <section key={index}>
        <h2 className="text-2xl font-semibold mb-3">{section.title}</h2>
        
        {section.content && (
          <p className="text-muted-foreground">{section.content}</p>
        )}
        
        {section.intro && (
          <p className="text-muted-foreground mb-3">{section.intro}</p>
        )}
        
        {section.isWarning && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4">
            <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              {section.warningTitle}
            </p>
            <ul className="list-disc list-inside space-y-2 text-yellow-700 dark:text-yellow-300 ml-4">
              {section.list?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {!section.isWarning && section.list && (
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            {section.list.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
        
        {section.subsections && (
          <div className="space-y-4 mt-4">
            {section.subsections.map((sub: any, i: number) => (
              <div key={i}>
                <h3 className="font-medium text-lg mb-2">{sub.subtitle}</h3>
                {sub.content && (
                  <p className="text-muted-foreground">{sub.content}</p>
                )}
                {sub.intro && (
                  <p className="text-muted-foreground mb-2">{sub.intro}</p>
                )}
                {sub.list && (
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    {sub.list.map((item: string, j: number) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
        
        {section.outro && (
          <p className="text-muted-foreground mt-3">{section.outro}</p>
        )}
        
        {section.contact && (
          <p className="text-primary font-medium mt-2">{section.contact}</p>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === 'es' ? 'Volver' : 'Back'}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              {language === 'es' ? 'Términos y Condiciones' : 'Terms and Conditions'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {language === 'es' ? 'Última actualización: Febrero 2026' : 'Last updated: February 2026'}
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {content.sections.map((section, index) => renderSection(section, index))}
            
            <div className="bg-primary/10 p-4 rounded-lg mt-8">
              <p className="text-sm text-foreground font-medium">
                {content.note}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
