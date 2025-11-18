import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Terms = () => {
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
          {t("terms.back")}
        </Button>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">{t("terms.title")}</CardTitle>
            <p className="text-muted-foreground">
              {t("terms.lastUpdated")}: {new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Aceptación de los Términos</h2>
              <p className="text-muted-foreground">
                Al acceder y utilizar Chefly AI Nutrition Coach ("la Aplicación", "nosotros", "nuestro"), 
                usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo 
                con alguna parte de estos términos, no debe utilizar nuestra aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Descripción del Servicio</h2>
              <p className="text-muted-foreground mb-3">
                Chefly AI Nutrition Coach es una aplicación web que proporciona:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Planes de comidas personalizados generados por inteligencia artificial</li>
                <li>Recomendaciones nutricionales basadas en sus objetivos y preferencias</li>
                <li>Seguimiento de progreso nutricional y logros</li>
                <li>Chat con coach de nutrición con IA</li>
                <li>Desafíos diarios y sistema de gamificación</li>
                <li>Listas de compras automatizadas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Registro de Cuenta</h2>
              <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Elegibilidad</h3>
              <p className="text-muted-foreground">
                Debe tener al menos 13 años de edad para usar esta aplicación. Si es menor de 18 años, 
                debe tener el consentimiento de un padre o tutor legal.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Información de Cuenta</h3>
              <p className="text-muted-foreground">
                Usted es responsable de:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                <li>Proporcionar información precisa y actualizada</li>
                <li>Mantener la confidencialidad de su contraseña</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
                <li>Todas las actividades que ocurran bajo su cuenta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Descargo de Responsabilidad Médica</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ IMPORTANTE: DESCARGO DE RESPONSABILIDAD MÉDICA
                </p>
                <ul className="list-disc list-inside space-y-2 text-yellow-700 dark:text-yellow-300 ml-4">
                  <li>Esta aplicación NO proporciona asesoramiento médico, diagnóstico o tratamiento</li>
                  <li>Los planes de comidas son generados por IA y son solo para fines informativos</li>
                  <li>Siempre consulte con un profesional de la salud antes de hacer cambios dietéticos significativos</li>
                  <li>Si tiene condiciones médicas, alergias graves o necesidades dietéticas especiales, 
                  consulte con un nutricionista o médico certificado</li>
                  <li>No somos responsables de reacciones adversas, alergias o problemas de salud derivados 
                  del uso de nuestras recomendaciones</li>
                  <li>Esta aplicación no reemplaza el consejo médico profesional</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Planes de Suscripción y Pagos</h2>
              <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Planes Disponibles</h3>
              <p className="text-muted-foreground">
                Ofrecemos diferentes planes de suscripción con características variables. Los detalles 
                de cada plan están disponibles en nuestra página de precios.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Período de Prueba</h3>
              <p className="text-muted-foreground">
                Los nuevos usuarios reciben un período de prueba de 4 días. Al finalizar el período de prueba, 
                se le pedirá que seleccione un plan de pago para continuar usando la aplicación.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">5.3 Facturación</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Los pagos se procesan de forma segura a través de Stripe</li>
                <li>Las suscripciones se renuevan automáticamente</li>
                <li>Los precios están en pesos mexicanos (MXN)</li>
                <li>Puede cancelar su suscripción en cualquier momento</li>
                <li>No se proporcionan reembolsos por períodos parciales</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">5.4 Cambios de Precio</h3>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de modificar los precios con un aviso previo de 30 días. 
                Los cambios no afectarán su ciclo de facturación actual.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Uso Aceptable</h2>
              <p className="text-muted-foreground mb-3">Usted se compromete a NO:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Usar la aplicación para fines ilegales o no autorizados</li>
                <li>Intentar acceder a áreas restringidas o datos de otros usuarios</li>
                <li>Interferir con el funcionamiento normal de la aplicación</li>
                <li>Realizar ingeniería inversa o intentar extraer el código fuente</li>
                <li>Transmitir virus, malware o código malicioso</li>
                <li>Acosar, abusar o dañar a otros usuarios</li>
                <li>Compartir su cuenta con terceros</li>
                <li>Usar bots o scripts automatizados</li>
                <li>Recopilar información de otros usuarios</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Propiedad Intelectual</h2>
              <h3 className="text-xl font-semibold mt-4 mb-2">7.1 Nuestra Propiedad</h3>
              <p className="text-muted-foreground">
                Todo el contenido de la aplicación, incluyendo pero no limitado a textos, gráficos, logos, 
                íconos, imágenes, clips de audio, descargas digitales, compilaciones de datos y software, 
                es propiedad de Chefly AI o de sus proveedores de contenido y está protegido por leyes de 
                propiedad intelectual.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">7.2 Su Contenido</h3>
              <p className="text-muted-foreground">
                Usted conserva todos los derechos sobre la información personal que proporciona. Al usar 
                la aplicación, nos otorga una licencia limitada para usar esta información para proporcionar 
                nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground mb-3">
                En la máxima medida permitida por la ley:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>La aplicación se proporciona "tal cual" sin garantías de ningún tipo</li>
                <li>No garantizamos que la aplicación esté libre de errores o ininterrumpida</li>
                <li>No somos responsables de daños directos, indirectos, incidentales o consecuentes</li>
                <li>No somos responsables de reacciones adversas a alimentos o planes dietéticos</li>
                <li>No garantizamos resultados específicos de salud o pérdida de peso</li>
                <li>Nuestra responsabilidad total no excederá el monto pagado en los últimos 12 meses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Indemnización</h2>
              <p className="text-muted-foreground">
                Usted acepta indemnizar y mantener indemne a Chefly AI, sus afiliados, empleados y socios 
                de cualquier reclamo, daño, pérdida o gasto (incluyendo honorarios legales) que surja de:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                <li>Su uso de la aplicación</li>
                <li>Su violación de estos Términos</li>
                <li>Su violación de derechos de terceros</li>
                <li>Consecuencias de salud derivadas del uso de la aplicación</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Terminación</h2>
              <p className="text-muted-foreground">
                Podemos suspender o terminar su acceso a la aplicación inmediatamente, sin previo aviso, 
                por cualquier motivo, incluyendo pero no limitado a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                <li>Violación de estos Términos</li>
                <li>Comportamiento fraudulento o ilegal</li>
                <li>Falta de pago</li>
                <li>Solicitud del usuario</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Usted puede cancelar su cuenta en cualquier momento desde la configuración de la aplicación.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Modificaciones del Servicio</h2>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto de la 
                aplicación en cualquier momento, con o sin aviso previo. No seremos responsables ante usted 
                o terceros por cualquier modificación, suspensión o discontinuación del servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Ley Aplicable y Jurisdicción</h2>
              <p className="text-muted-foreground">
                Estos Términos se regirán e interpretarán de acuerdo con las leyes de México. Cualquier 
                disputa relacionada con estos Términos estará sujeta a la jurisdicción exclusiva de los 
                tribunales de México.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Disposiciones Generales</h2>
              <h3 className="text-xl font-semibold mt-4 mb-2">13.1 Acuerdo Completo</h3>
              <p className="text-muted-foreground">
                Estos Términos constituyen el acuerdo completo entre usted y Chefly AI respecto al uso 
                de la aplicación.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">13.2 Divisibilidad</h3>
              <p className="text-muted-foreground">
                Si alguna disposición de estos Términos se considera inválida, las disposiciones restantes 
                continuarán en pleno vigor.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">13.3 Renuncia</h3>
              <p className="text-muted-foreground">
                El hecho de que no ejerzamos o hagamos valer algún derecho no constituye una renuncia a 
                dicho derecho.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">14. Contacto</h2>
              <p className="text-muted-foreground">
                Para preguntas sobre estos Términos y Condiciones, puede contactarnos en:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground ml-4 mt-3">
                <li><strong>Email:</strong> legal@chefly-ai.com</li>
                <li><strong>Soporte:</strong> support@chefly-ai.com</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Al continuar usando Chefly AI Nutrition Coach, usted reconoce 
                que ha leído, entendido y aceptado estos Términos y Condiciones en su totalidad.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
