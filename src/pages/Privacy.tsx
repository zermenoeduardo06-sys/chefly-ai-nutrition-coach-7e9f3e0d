import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const privacyContent = {
  es: {
    sections: [
      {
        title: "1. Introducción",
        content: "Bienvenido a Chefly AI Nutrition Coach (\"nosotros\", \"nuestro\" o \"la aplicación\"). Nos comprometemos a proteger su privacidad y garantizar la seguridad de su información personal. Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos su información cuando utiliza nuestra aplicación de planificación nutricional."
      },
      {
        title: "2. Información que Recopilamos",
        subsections: [
          {
            subtitle: "2.1 Información Proporcionada por Usted",
            list: [
              "<strong>Información de Cuenta:</strong> Email, contraseña (encriptada)",
              "<strong>Información Personal:</strong> Edad, peso, género (opcional)",
              "<strong>Preferencias Nutricionales:</strong> Objetivos de salud, tipo de dieta, alergias alimentarias, ingredientes no deseados, sabores preferidos, tipos de cocina preferidos",
              "<strong>Información de Cocina:</strong> Nivel de habilidad culinaria, presupuesto, tiempo de cocción disponible, número de porciones, complejidad de recetas preferida",
              "<strong>Datos de Actividad:</strong> Nivel de actividad física",
              "<strong>Notas Adicionales:</strong> Cualquier comentario o preferencia adicional que proporcione"
            ]
          },
          {
            subtitle: "2.2 Información Recopilada Automáticamente",
            list: [
              "<strong>Datos de Uso:</strong> Interacciones con la aplicación, comidas completadas, logros desbloqueados",
              "<strong>Información de Dispositivo:</strong> Tipo de dispositivo, sistema operativo, identificadores únicos",
              "<strong>Datos de Cookies:</strong> Utilizamos cookies para mantener su sesión activa y mejorar la experiencia"
            ]
          }
        ]
      },
      {
        title: "3. Cómo Usamos su Información",
        intro: "Utilizamos la información recopilada para:",
        list: [
          "Generar planes de comidas personalizados utilizando inteligencia artificial",
          "Proporcionar recomendaciones nutricionales adaptadas a sus objetivos",
          "Procesar sus pagos de suscripción a través de Stripe",
          "Mantener y mejorar nuestros servicios",
          "Enviar notificaciones sobre su cuenta y servicios",
          "Analizar el uso de la aplicación para mejorar la experiencia del usuario",
          "Prevenir fraude y garantizar la seguridad de la plataforma",
          "Cumplir con obligaciones legales"
        ]
      },
      {
        title: "4. Compartir Información",
        intro: "No vendemos su información personal. Compartimos información solo en estos casos:",
        subsections: [
          {
            subtitle: "4.1 Proveedores de Servicios",
            list: [
              "<strong>Supabase:</strong> Almacenamiento seguro de datos y autenticación",
              "<strong>Stripe:</strong> Procesamiento de pagos (no almacenamos datos de tarjetas)",
              "<strong>Lovable AI:</strong> Generación de planes de comidas personalizados"
            ]
          },
          {
            subtitle: "4.2 Cumplimiento Legal",
            content: "Podemos divulgar información si es requerido por ley, orden judicial, o para proteger nuestros derechos o los de otros usuarios."
          }
        ]
      },
      {
        title: "5. Seguridad de Datos",
        intro: "Implementamos medidas de seguridad técnicas y organizativas para proteger su información:",
        list: [
          "Encriptación de datos en tránsito (HTTPS/TLS)",
          "Encriptación de contraseñas",
          "Políticas de seguridad de nivel de fila (RLS) en base de datos",
          "Autenticación segura mediante Supabase Auth",
          "Monitoreo regular de seguridad",
          "Acceso restringido a datos personales"
        ],
        outro: "Sin embargo, ningún método de transmisión por Internet es 100% seguro. No podemos garantizar la seguridad absoluta de su información."
      },
      {
        title: "6. Sus Derechos",
        intro: "Usted tiene derecho a:",
        list: [
          "<strong>Acceso:</strong> Solicitar una copia de sus datos personales",
          "<strong>Rectificación:</strong> Corregir datos inexactos o incompletos",
          "<strong>Eliminación:</strong> Solicitar la eliminación de sus datos",
          "<strong>Portabilidad:</strong> Recibir sus datos en formato estructurado",
          "<strong>Oposición:</strong> Oponerse al procesamiento de sus datos",
          "<strong>Restricción:</strong> Solicitar la limitación del procesamiento",
          "<strong>Retirar Consentimiento:</strong> Retirar su consentimiento en cualquier momento"
        ],
        outro: "Para ejercer estos derechos, puede ajustar sus preferencias en la aplicación o contactarnos directamente."
      },
      {
        title: "7. Retención de Datos",
        content: "Retenemos su información personal mientras mantenga una cuenta activa o según sea necesario para proporcionar nuestros servicios. Si solicita la eliminación de su cuenta, eliminaremos o anonimizaremos sus datos dentro de 30 días, excepto cuando estemos obligados legalmente a retener cierta información."
      },
      {
        title: "8. Cookies y Tecnologías Similares",
        intro: "Utilizamos cookies y tecnologías similares para:",
        list: [
          "Mantener su sesión activa",
          "Recordar sus preferencias",
          "Analizar el uso de la aplicación",
          "Mejorar la seguridad"
        ],
        outro: "Puede configurar su navegador para rechazar cookies, pero esto puede afectar la funcionalidad de la aplicación."
      },
      {
        title: "9. Privacidad de Menores",
        content: "Nuestra aplicación no está dirigida a menores de 13 años. No recopilamos intencionalmente información personal de menores de 13 años. Si descubrimos que hemos recopilado información de un menor, la eliminaremos de inmediato."
      },
      {
        title: "10. Transferencias Internacionales",
        content: "Sus datos pueden ser transferidos y almacenados en servidores ubicados fuera de su país. Implementamos medidas de seguridad apropiadas para proteger su información durante estas transferencias, cumpliendo con las regulaciones aplicables."
      },
      {
        title: "11. Cambios a esta Política",
        content: "Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios significativos mediante un aviso en la aplicación o por email. La fecha de \"Última actualización\" al inicio de esta política indica cuándo fue modificada por última vez."
      },
      {
        title: "12. Contacto",
        intro: "Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad o el manejo de sus datos personales, puede contactarnos a través de:",
        contacts: [
          { label: "Email", value: "privacy@chefly-ai.com" },
          { label: "Dentro de la aplicación", value: "Sección de configuración" }
        ]
      },
      {
        title: "13. Consentimiento",
        content: "Al utilizar nuestra aplicación, usted consiente la recopilación y uso de su información según se describe en esta Política de Privacidad. Si no está de acuerdo con esta política, por favor no utilice nuestra aplicación."
      }
    ],
    note: "Esta Política de Privacidad está diseñada para cumplir con regulaciones generales de protección de datos. Recomendamos consultar con un abogado especializado en privacidad de datos para asegurar el cumplimiento completo con las leyes aplicables en su jurisdicción."
  },
  en: {
    sections: [
      {
        title: "1. Introduction",
        content: "Welcome to Chefly AI Nutrition Coach (\"we\", \"our\" or \"the application\"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and protect your information when you use our nutritional planning application."
      },
      {
        title: "2. Information We Collect",
        subsections: [
          {
            subtitle: "2.1 Information Provided by You",
            list: [
              "<strong>Account Information:</strong> Email, password (encrypted)",
              "<strong>Personal Information:</strong> Age, weight, gender (optional)",
              "<strong>Nutritional Preferences:</strong> Health goals, diet type, food allergies, disliked ingredients, preferred flavors, preferred cuisine types",
              "<strong>Cooking Information:</strong> Culinary skill level, budget, available cooking time, number of servings, preferred recipe complexity",
              "<strong>Activity Data:</strong> Physical activity level",
              "<strong>Additional Notes:</strong> Any additional comments or preferences you provide"
            ]
          },
          {
            subtitle: "2.2 Automatically Collected Information",
            list: [
              "<strong>Usage Data:</strong> Application interactions, completed meals, unlocked achievements",
              "<strong>Device Information:</strong> Device type, operating system, unique identifiers",
              "<strong>Cookie Data:</strong> We use cookies to keep your session active and improve your experience"
            ]
          }
        ]
      },
      {
        title: "3. How We Use Your Information",
        intro: "We use the collected information to:",
        list: [
          "Generate personalized meal plans using artificial intelligence",
          "Provide nutritional recommendations tailored to your goals",
          "Process your subscription payments through Stripe",
          "Maintain and improve our services",
          "Send notifications about your account and services",
          "Analyze application usage to improve user experience",
          "Prevent fraud and ensure platform security",
          "Comply with legal obligations"
        ]
      },
      {
        title: "4. Information Sharing",
        intro: "We do not sell your personal information. We share information only in these cases:",
        subsections: [
          {
            subtitle: "4.1 Service Providers",
            list: [
              "<strong>Supabase:</strong> Secure data storage and authentication",
              "<strong>Stripe:</strong> Payment processing (we do not store card data)",
              "<strong>Lovable AI:</strong> Personalized meal plan generation"
            ]
          },
          {
            subtitle: "4.2 Legal Compliance",
            content: "We may disclose information if required by law, court order, or to protect our rights or those of other users."
          }
        ]
      },
      {
        title: "5. Data Security",
        intro: "We implement technical and organizational security measures to protect your information:",
        list: [
          "Data encryption in transit (HTTPS/TLS)",
          "Password encryption",
          "Row-level security (RLS) policies in database",
          "Secure authentication via Supabase Auth",
          "Regular security monitoring",
          "Restricted access to personal data"
        ],
        outro: "However, no method of Internet transmission is 100% secure. We cannot guarantee the absolute security of your information."
      },
      {
        title: "6. Your Rights",
        intro: "You have the right to:",
        list: [
          "<strong>Access:</strong> Request a copy of your personal data",
          "<strong>Rectification:</strong> Correct inaccurate or incomplete data",
          "<strong>Deletion:</strong> Request deletion of your data",
          "<strong>Portability:</strong> Receive your data in a structured format",
          "<strong>Objection:</strong> Object to the processing of your data",
          "<strong>Restriction:</strong> Request limitation of processing",
          "<strong>Withdraw Consent:</strong> Withdraw your consent at any time"
        ],
        outro: "To exercise these rights, you can adjust your preferences in the application or contact us directly."
      },
      {
        title: "7. Data Retention",
        content: "We retain your personal information while you maintain an active account or as necessary to provide our services. If you request account deletion, we will delete or anonymize your data within 30 days, except when legally required to retain certain information."
      },
      {
        title: "8. Cookies and Similar Technologies",
        intro: "We use cookies and similar technologies to:",
        list: [
          "Keep your session active",
          "Remember your preferences",
          "Analyze application usage",
          "Improve security"
        ],
        outro: "You can configure your browser to reject cookies, but this may affect the functionality of the application."
      },
      {
        title: "9. Children's Privacy",
        content: "Our application is not directed to children under 13 years of age. We do not intentionally collect personal information from children under 13. If we discover that we have collected information from a minor, we will delete it immediately."
      },
      {
        title: "10. International Transfers",
        content: "Your data may be transferred and stored on servers located outside your country. We implement appropriate security measures to protect your information during these transfers, in compliance with applicable regulations."
      },
      {
        title: "11. Changes to This Policy",
        content: "We may update this Privacy Policy periodically. We will notify you of significant changes through a notice in the application or by email. The \"Last Updated\" date at the beginning of this policy indicates when it was last modified."
      },
      {
        title: "12. Contact",
        intro: "If you have questions, concerns, or requests related to this Privacy Policy or the handling of your personal data, you can contact us through:",
        contacts: [
          { label: "Email", value: "privacy@chefly-ai.com" },
          { label: "Within the application", value: "Settings section" }
        ]
      },
      {
        title: "13. Consent",
        content: "By using our application, you consent to the collection and use of your information as described in this Privacy Policy. If you do not agree with this policy, please do not use our application."
      }
    ],
    note: "This Privacy Policy is designed to comply with general data protection regulations. We recommend consulting with a data privacy attorney to ensure full compliance with applicable laws in your jurisdiction."
  }
};

const Privacy = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const content = privacyContent[language as keyof typeof privacyContent] || privacyContent.es;

  const renderListItem = (item: string) => {
    if (item.includes('<strong>')) {
      const parts = item.split(/<\/?strong>/);
      return (
        <>
          <strong>{parts[1]}</strong>{parts[2]}
        </>
      );
    }
    return item;
  };

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
        
        {section.list && (
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            {section.list.map((item: string, i: number) => (
              <li key={i}>{renderListItem(item)}</li>
            ))}
          </ul>
        )}
        
        {section.subsections?.map((sub: any, i: number) => (
          <div key={i}>
            <h3 className="text-xl font-semibold mt-4 mb-2">{sub.subtitle}</h3>
            {sub.content && (
              <p className="text-muted-foreground">{sub.content}</p>
            )}
            {sub.intro && (
              <p className="text-muted-foreground">{sub.intro}</p>
            )}
            {sub.list && (
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                {sub.list.map((item: string, j: number) => (
                  <li key={j}>{renderListItem(item)}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        
        {section.outro && (
          <p className="text-muted-foreground mt-3">{section.outro}</p>
        )}
        
        {section.contacts && (
          <ul className="list-none space-y-2 text-muted-foreground ml-4 mt-3">
            {section.contacts.map((contact: { label: string; value: string }, i: number) => (
              <li key={i}><strong>{contact.label}:</strong> {contact.value}</li>
            ))}
          </ul>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("privacy.back")}
        </Button>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">{t("privacy.title")}</CardTitle>
            <p className="text-muted-foreground">
              {t("privacy.lastUpdated")}: {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {content.sections.map((section, index) => renderSection(section, index))}

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{language === 'es' ? 'Nota Legal:' : 'Legal Note:'}</strong> {content.note}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;