// BURBUJA DE MENSAJE (forma de nube, animación iOS)
// Muestra cada mensaje del chat con forma redondeada tipo nube y animación de entrada estilo iPhone.
// Mensajes del usuario: derecha, color cian. Mensajes de la IA: izquierda, color oscuro.
import { Message } from "@workspace/api-client-react";
import { UserAvatarBadge } from "../common/UserAvatarBadge";
import { useAuth } from "../../contexts/AuthContext";
import { OnyxLogo } from "../common/OnyxLogo";
import { Copy, Check, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "../../hooks/useTranslation";
import { useState } from "react";

const CORREO_SOPORTE = "zercxiasupport@gmail.com";

interface BurbujaMensajeProps {
  message: Message;
  index?: number;
}

export function ChatMessageBubble({ message, index = 0 }: BurbujaMensajeProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const esMensajeUsuario = message.role === "user";
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = () => {
    navigator.clipboard.writeText(message.content);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
    toast({ title: t("copied"), description: "El mensaje ha sido copiado." });
  };

  const handleReportar = async () => {
    try {
      const token = localStorage.getItem("onyx_token");
      await fetch("/api/reportes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mensajeId: message.id,
          contenido: message.content,
          motivo: "Respuesta incorrecta o inapropiada",
        }),
      });
    } catch { /* silencioso */ }

    const asunto = encodeURIComponent("[ZerCX AI] Reporte de respuesta incorrecta");
    const cuerpo = encodeURIComponent(
      `Hola, quiero reportar esta respuesta de ZerCX AI:\n\n` +
      `"${message.content}"\n\n` +
      `Motivo:\n(Escribe aquí el motivo)\n\n` +
      `---\nEnviado desde ZerCX AI`
    );
    window.open(`mailto:${CORREO_SOPORTE}?subject=${asunto}&body=${cuerpo}`, "_blank");
    toast({ title: t("reportSent"), description: "Se abrió tu correo con el reporte listo para enviar." });
  };

  // Delay escalonado para efecto cascada tipo iMessage
  const delay = `${Math.min(index * 60, 400)}ms`;

  return (
    <div
      className={`flex w-full ${esMensajeUsuario ? "justify-end" : "justify-start"} mb-5 animate-msg-in`}
      style={{ animationDelay: delay }}
    >
      <div className={`flex max-w-[85%] ${esMensajeUsuario ? "flex-row-reverse" : "flex-row"} items-end gap-2.5`}>
        {/* Avatar */}
        <div className="flex-shrink-0 mb-1">
          {esMensajeUsuario ? (
            user ? <UserAvatarBadge user={user} className="w-7 h-7 text-xs" /> : null
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
              <OnyxLogo className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className={`flex flex-col gap-1.5 ${esMensajeUsuario ? "items-end" : "items-start"}`}>
          {/* Burbuja */}
          <div
            className={`px-5 py-3.5 text-[14px] leading-relaxed whitespace-pre-wrap ${
              esMensajeUsuario
                ? "bg-primary text-primary-foreground rounded-[26px] rounded-tr-[6px] shadow-lg shadow-primary/25"
                : "glass-panel text-foreground rounded-[26px] rounded-tl-[6px] shadow-lg shadow-black/20"
            }`}
          >
            {message.content}
          </div>

          {/* Acciones — solo mensajes de la IA */}
          {!esMensajeUsuario && (
            <div className="flex items-center gap-3 px-2">
              <button
                onClick={handleCopiar}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiado
                  ? <Check className="w-3 h-3 text-primary" />
                  : <Copy className="w-3 h-3" />}
                <span>{copiado ? t("copied") : t("copy")}</span>
              </button>
              <span className="text-muted-foreground/30">·</span>
              <button
                onClick={handleReportar}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
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
