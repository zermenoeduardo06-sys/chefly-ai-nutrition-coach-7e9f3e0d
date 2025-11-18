import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Privacy = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

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
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introducción</h2>
              <p className="text-muted-foreground">
                Bienvenido a Chefly AI Nutrition Coach ("nosotros", "nuestro" o "la aplicación"). 
                Nos comprometemos a proteger su privacidad y garantizar la seguridad de su información personal. 
                Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos su información 
                cuando utiliza nuestra aplicación de planificación nutricional.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Información que Recopilamos</h2>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">2.1 Información Proporcionada por Usted</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Información de Cuenta:</strong> Email, contraseña (encriptada)</li>
                <li><strong>Información Personal:</strong> Edad, peso, género (opcional)</li>
                <li><strong>Preferencias Nutricionales:</strong> Objetivos de salud, tipo de dieta, alergias alimentarias, 
                ingredientes no deseados, sabores preferidos, tipos de cocina preferidos</li>
                <li><strong>Información de Cocina:</strong> Nivel de habilidad culinaria, presupuesto, tiempo de cocción 
                disponible, número de porciones, complejidad de recetas preferida</li>
                <li><strong>Datos de Actividad:</strong> Nivel de actividad física</li>
                <li><strong>Notas Adicionales:</strong> Cualquier comentario o preferencia adicional que proporcione</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">2.2 Información Recopilada Automáticamente</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Datos de Uso:</strong> Interacciones con la aplicación, comidas completadas, logros desbloqueados</li>
                <li><strong>Información de Dispositivo:</strong> Tipo de dispositivo, sistema operativo, identificadores únicos</li>
                <li><strong>Datos de Cookies:</strong> Utilizamos cookies para mantener su sesión activa y mejorar la experiencia</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Cómo Usamos su Información</h2>
              <p className="text-muted-foreground mb-3">Utilizamos la información recopilada para:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Generar planes de comidas personalizados utilizando inteligencia artificial</li>
                <li>Proporcionar recomendaciones nutricionales adaptadas a sus objetivos</li>
                <li>Procesar sus pagos de suscripción a través de Stripe</li>
                <li>Mantener y mejorar nuestros servicios</li>
                <li>Enviar notificaciones sobre su cuenta y servicios</li>
                <li>Analizar el uso de la aplicación para mejorar la experiencia del usuario</li>
                <li>Prevenir fraude y garantizar la seguridad de la plataforma</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Compartir Información</h2>
              <p className="text-muted-foreground mb-3">No vendemos su información personal. Compartimos información solo en estos casos:</p>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Proveedores de Servicios</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Supabase:</strong> Almacenamiento seguro de datos y autenticación</li>
                <li><strong>Stripe:</strong> Procesamiento de pagos (no almacenamos datos de tarjetas)</li>
                <li><strong>Lovable AI:</strong> Generación de planes de comidas personalizados</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Cumplimiento Legal</h3>
              <p className="text-muted-foreground">
                Podemos divulgar información si es requerido por ley, orden judicial, o para proteger 
                nuestros derechos o los de otros usuarios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Seguridad de Datos</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                <li>Encriptación de datos en tránsito (HTTPS/TLS)</li>
                <li>Encriptación de contraseñas</li>
                <li>Políticas de seguridad de nivel de fila (RLS) en base de datos</li>
                <li>Autenticación segura mediante Supabase Auth</li>
                <li>Monitoreo regular de seguridad</li>
                <li>Acceso restringido a datos personales</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Sin embargo, ningún método de transmisión por Internet es 100% seguro. No podemos garantizar 
                la seguridad absoluta de su información.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Sus Derechos</h2>
              <p className="text-muted-foreground mb-3">Usted tiene derecho a:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                <li><strong>Restricción:</strong> Solicitar la limitación del procesamiento</li>
                <li><strong>Retirar Consentimiento:</strong> Retirar su consentimiento en cualquier momento</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Para ejercer estos derechos, puede ajustar sus preferencias en la aplicación o contactarnos directamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Retención de Datos</h2>
              <p className="text-muted-foreground">
                Retenemos su información personal mientras mantenga una cuenta activa o según sea necesario 
                para proporcionar nuestros servicios. Si solicita la eliminación de su cuenta, eliminaremos 
                o anonimizaremos sus datos dentro de 30 días, excepto cuando estemos obligados legalmente a 
                retener cierta información.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Cookies y Tecnologías Similares</h2>
              <p className="text-muted-foreground">
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                <li>Mantener su sesión activa</li>
                <li>Recordar sus preferencias</li>
                <li>Analizar el uso de la aplicación</li>
                <li>Mejorar la seguridad</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Puede configurar su navegador para rechazar cookies, pero esto puede afectar la funcionalidad 
                de la aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Privacidad de Menores</h2>
              <p className="text-muted-foreground">
                Nuestra aplicación no está dirigida a menores de 13 años. No recopilamos intencionalmente 
                información personal de menores de 13 años. Si descubrimos que hemos recopilado información 
                de un menor, la eliminaremos de inmediato.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Transferencias Internacionales</h2>
              <p className="text-muted-foreground">
                Sus datos pueden ser transferidos y almacenados en servidores ubicados fuera de su país. 
                Implementamos medidas de seguridad apropiadas para proteger su información durante estas 
                transferencias, cumpliendo con las regulaciones aplicables.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Cambios a esta Política</h2>
              <p className="text-muted-foreground">
                Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios 
                significativos mediante un aviso en la aplicación o por email. La fecha de "Última actualización" 
                al inicio de esta política indica cuándo fue modificada por última vez.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Contacto</h2>
              <p className="text-muted-foreground">
                Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad o 
                el manejo de sus datos personales, puede contactarnos a través de:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground ml-4 mt-3">
                <li><strong>Email:</strong> privacy@chefly-ai.com</li>
                <li><strong>Dentro de la aplicación:</strong> Sección de configuración</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Consentimiento</h2>
              <p className="text-muted-foreground">
                Al utilizar nuestra aplicación, usted consiente la recopilación y uso de su información según 
                se describe en esta Política de Privacidad. Si no está de acuerdo con esta política, por favor 
                no utilice nuestra aplicación.
              </p>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Nota Legal:</strong> Esta Política de Privacidad está diseñada para cumplir con 
                regulaciones generales de protección de datos. Recomendamos consultar con un abogado 
                especializado en privacidad de datos para asegurar el cumplimiento completo con las leyes 
                aplicables en su jurisdicción.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
