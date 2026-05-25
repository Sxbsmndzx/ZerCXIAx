import { AppLayout } from "../components/layout/AppLayout";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

export default function TermsPage() {
  useAuthGuard();

  return (
    <AppLayout>
      <ScrollArea className="h-full">
        <div className="max-w-3xl mx-auto px-4 py-8 md:px-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Términos y Condiciones</h1>
              <p className="text-sm text-muted-foreground mt-1">Última actualización: 25 de mayo de 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">1. Aceptación de los términos</h2>
              <p>
                Al acceder y utilizar Onyx AI ("el Servicio"), aceptas estos Términos y Condiciones en su totalidad.
                Si no estás de acuerdo con alguna parte de estos términos, no deberás utilizar el Servicio.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">2. Descripción del servicio</h2>
              <p>
                Onyx AI es una plataforma de inteligencia artificial conversacional que permite a los usuarios
                interactuar con un asistente de IA basado en modelos de lenguaje avanzados. El Servicio incluye
                funcionalidades de chat, historial de conversaciones, configuración personalizada y otras
                características que se puedan añadir en el futuro.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">3. Registro y cuentas de usuario</h2>
              <p>
                Para utilizar el Servicio, es necesario crear una cuenta proporcionando un nombre, correo
                electrónico y contraseña. Eres responsable de:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Mantener la confidencialidad de tu contraseña.</li>
                <li>Todas las actividades que ocurran bajo tu cuenta.</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado.</li>
                <li>Proporcionar información veraz y actualizada.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">4. Uso aceptable</h2>
              <p>Al utilizar Onyx AI, te comprometes a NO:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Usar el Servicio para actividades ilegales o perjudiciales.</li>
                <li>Intentar acceder sin autorización a sistemas informáticos.</li>
                <li>Generar o distribuir contenido dañino, ofensivo o ilegal.</li>
                <li>Hacer un uso excesivo del Servicio que afecte a otros usuarios.</li>
                <li>Revender o redistribuir el acceso al Servicio sin autorización.</li>
                <li>Usar el Servicio para spam, phishing o fraude.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">5. Privacidad y datos</h2>
              <p>
                Recopilamos y procesamos datos personales de acuerdo con nuestra Política de Privacidad.
                Al usar el Servicio, consientes la recopilación y uso de tus datos tal como se describe en dicha política.
              </p>
              <p>
                Las conversaciones pueden ser utilizadas para mejorar el modelo de IA, a menos que desactives
                esta opción en la Configuración {">"} Privacidad y Datos.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">6. Propiedad intelectual</h2>
              <p>
                El contenido generado por la IA se proporciona únicamente como herramienta de asistencia.
                Onyx AI no reclama propiedad sobre el contenido que generas usando el Servicio, pero tampoco
                garantiza que dicho contenido sea libre de derechos de terceros.
              </p>
              <p>
                El nombre "Onyx AI", su logo, diseño y software son propiedad exclusiva del equipo de Onyx.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">7. Limitación de responsabilidad</h2>
              <p>
                Onyx AI se proporciona "tal cual" sin garantías de ningún tipo. No garantizamos que:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>El Servicio esté disponible de forma ininterrumpida.</li>
                <li>Las respuestas de la IA sean precisas, completas o actualizadas.</li>
                <li>El Servicio esté libre de errores o vulnerabilidades.</li>
              </ul>
              <p>
                No seremos responsables por daños indirectos, incidentales o consecuentes derivados del uso del Servicio.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">8. Modificaciones del servicio</h2>
              <p>
                Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio en cualquier momento,
                con o sin previo aviso. También podemos actualizar estos Términos y Condiciones; te notificaremos
                de cambios significativos.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">9. Terminación</h2>
              <p>
                Podemos suspender o eliminar tu cuenta si violas estos Términos. También puedes eliminar tu cuenta
                en cualquier momento desde la Configuración de la aplicación.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">10. Contacto</h2>
              <p>
                Si tienes preguntas sobre estos Términos y Condiciones, contáctanos en:
              </p>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="font-medium text-primary">Onyxaisupport@gmail.com</p>
                <p className="text-muted-foreground text-xs mt-1">Respondemos en un plazo de 48 horas hábiles.</p>
              </div>
            </section>
          </div>
        </div>
      </ScrollArea>
    </AppLayout>
  );
}
