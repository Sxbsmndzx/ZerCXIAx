// BURBUJA DE MENSAJE
// Muestra cada mensaje del chat. Mensajes del usuario a la derecha, de la IA a la izquierda.
// Botones de acción (Copiar, Reportar) aparecen debajo de los mensajes de la IA.
import { Message } from "@workspace/api-client-react";
import { UserAvatarBadge } from "../common/UserAvatarBadge";
import { useAuth } from "../../contexts/AuthContext";
import { OnyxLogo } from "../common/OnyxLogo";
import { Copy, Check, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "../../hooks/useTranslation";
import { useState } from "react";

// Correo de soporte al que llegan los reportes de mensajes
const CORREO_SOPORTE = "zercxiasupport@gmail.com";

interface BurbujaMensajeProps {
  message: Message;
}

export function ChatMessageBubble({ message }: BurbujaMensajeProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const esMensajeUsuario = message.role === "user";
  const [copiado, setCopiado] = useState(false);

  // Copia el texto del mensaje al portapapeles
  const handleCopiar = () => {
    navigator.clipboard.writeText(message.content);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
    toast({ title: t("copied"), description: "El mensaje ha sido copiado." });
  };

  // Abre el correo del usuario con el reporte pre-llenado
  const handleReportar = () => {
    const asunto = encodeURIComponent("[ZerCX AI] Reporte de respuesta incorrecta");
    const cuerpo = encodeURIComponent(
      `Hola, quiero reportar la siguiente respuesta de ZerCX AI:\n\n` +
      `"${message.content}"\n\n` +
      `Motivo del reporte:\n(Escribe aquí el motivo)\n\n` +
      `---\nEnviado desde ZerCX AI`
    );
    window.open(`mailto:${CORREO_SOPORTE}?subject=${asunto}&body=${cuerpo}`, "_blank");
    toast({
      title: t("reportSent"),
      description: "Se abrió tu correo con el reporte listo para enviar.",
    });
  };

  return (
    <div className={`flex w-full ${esMensajeUsuario ? "justify-end" : "justify-start"} mb-5`}>
      <div className={`flex max-w-[85%] ${esMensajeUsuario ? "flex-row-reverse" : "flex-row"} items-start gap-3`}>
        {/* Avatar del usuario o logo de la IA */}
        <div className="flex-shrink-0 mt-0.5">
          {esMensajeUsuario ? (
            user ? <UserAvatarBadge user={user} className="w-8 h-8 text-xs" /> : null
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
              <OnyxLogo className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className={`flex flex-col gap-1.5 ${esMensajeUsuario ? "items-end" : "items-start"}`}>
          {/* Burbuja del mensaje */}
          <div
            className={`px-4 py-3 rounded-2xl ${
              esMensajeUsuario
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-card border border-border text-foreground rounded-tl-sm shadow-sm"
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed text-[14px]">{message.content}</p>
          </div>

          {/* Botones de acción (solo en mensajes de la IA) */}
          {!esMensajeUsuario && (
            <div className="flex items-center gap-3 px-1">
              {/* Botón Copiar */}
              <button
                onClick={handleCopiar}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Copiar texto"
              >
                {copiado ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiado ? t("copied") : t("copy")}</span>
              </button>

              {/* Separador visual */}
              <span className="text-muted-foreground/30 text-xs">·</span>

              {/* Botón Reportar — abre correo pre-llenado */}
              <button
                onClick={handleReportar}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                title="Reportar respuesta incorrecta"
              >
                <Flag className="w-3 h-3" />
                <span>{t("report")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
