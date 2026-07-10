// BURBUJA DE MENSAJE (forma de nube)
// Muestra cada mensaje del chat con forma redondeada tipo nube.
// Mensajes del usuario: derecha, color cian. Mensajes de la IA: izquierda, color oscuro.
// Botones de acción (Copiar, Reportar) aparecen debajo de los mensajes de la IA.
import { Message } from "@workspace/api-client-react";
import { UserAvatarBadge } from "../common/UserAvatarBadge";
import { useAuth } from "../../contexts/AuthContext";
import { OnyxLogo } from "../common/OnyxLogo";
import { Copy, Check, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "../../hooks/useTranslation";
import { useState } from "react";

// Correo de soporte al que llegan los reportes
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

  // Copia el texto al portapapeles
  const handleCopiar = () => {
    navigator.clipboard.writeText(message.content);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
    toast({ title: t("copied"), description: "El mensaje ha sido copiado." });
  };

  // Reporta la respuesta: guarda en la base de datos Y abre el correo pre-llenado
  const handleReportar = async () => {
    // 1. Guardar en la base de datos (silencioso si falla)
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
    } catch {
      // Si falla el guardado, igual abrimos el correo
    }

    // 2. Abrir el correo del usuario pre-llenado
    const asunto = encodeURIComponent("[ZerCX AI] Reporte de respuesta incorrecta");
    const cuerpo = encodeURIComponent(
      `Hola, quiero reportar esta respuesta de ZerCX AI:\n\n` +
      `"${message.content}"\n\n` +
      `Motivo:\n(Escribe aquí el motivo)\n\n` +
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
      <div className={`flex max-w-[85%] ${esMensajeUsuario ? "flex-row-reverse" : "flex-row"} items-end gap-2.5`}>
        {/* Avatar o logo */}
        <div className="flex-shrink-0 mb-1">
          {esMensajeUsuario ? (
            user ? <UserAvatarBadge user={user} className="w-7 h-7 text-xs" /> : null
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <OnyxLogo className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className={`flex flex-col gap-1.5 ${esMensajeUsuario ? "items-end" : "items-start"}`}>
          {/* Burbuja con forma de nube — muy redondeada con una esquina pequeña como cola */}
          <div
            className={`px-5 py-3.5 text-[14px] leading-relaxed whitespace-pre-wrap ${
              esMensajeUsuario
                ? "bg-primary text-primary-foreground rounded-[28px] rounded-tr-[6px] shadow-lg shadow-primary/20"
                : "bg-card/90 backdrop-blur-sm border border-border/60 text-foreground rounded-[28px] rounded-tl-[6px] shadow-lg shadow-black/30"
            }`}
          >
            {message.content}
          </div>

          {/* Botones de acción (solo mensajes de la IA) */}
          {!esMensajeUsuario && (
            <div className="flex items-center gap-3 px-2">
              {/* Copiar */}
              <button
                onClick={handleCopiar}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Copiar respuesta"
              >
                {copiado ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiado ? t("copied") : t("copy")}</span>
              </button>

              <span className="text-muted-foreground/30">·</span>

              {/* Reportar */}
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
