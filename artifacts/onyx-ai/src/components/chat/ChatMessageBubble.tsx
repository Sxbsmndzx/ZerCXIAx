// BURBUJA DE MENSAJE — animación iOS, glassmorphism
import { Message } from "@workspace/api-client-react";
import { UserAvatarBadge } from "../common/UserAvatarBadge";
import { useAuth } from "../../contexts/AuthContext";
import { OnyxLogo } from "../common/OnyxLogo";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "../../hooks/useTranslation";
import { useState } from "react";
import { ReportErrorDialog } from "../common/ReportErrorDialog";

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
  const [reportOpen, setReportOpen] = useState(false);

  const handleCopiar = () => {
    navigator.clipboard.writeText(message.content);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
    toast({ title: t("copied"), description: "El mensaje ha sido copiado." });
  };

  // Delay escalonado para efecto cascada tipo iMessage
  const delay = `${Math.min(index * 55, 380)}ms`;

  return (
    <>
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
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm ring-1 ring-primary/5">
                <OnyxLogo className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className={`flex flex-col gap-1.5 ${esMensajeUsuario ? "items-end" : "items-start"}`}>
            {/* Burbuja */}
            <div
              className={`px-5 py-3.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words ${
                esMensajeUsuario
                  ? "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground rounded-[26px] rounded-tr-[6px] shadow-lg shadow-primary/30"
                  : "glass-panel text-foreground rounded-[26px] rounded-tl-[6px] shadow-lg shadow-black/15 border border-white/5"
              }`}
            >
              {message.content}
            </div>

            {/* Acciones — solo mensajes de la IA */}
            {!esMensajeUsuario && (
              <div className="flex items-center gap-3 px-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                <button
                  onClick={handleCopiar}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                >
                  {copiado
                    ? <Check className="w-3 h-3 text-primary" />
                    : <Copy className="w-3 h-3" />}
                  <span>{copiado ? t("copied") : t("copy")}</span>
                </button>
                <span className="text-muted-foreground/30">·</span>
                <button
                  onClick={() => setReportOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-all hover:scale-105"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Informar error</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReportErrorDialog open={reportOpen} onOpenChange={setReportOpen} />
    </>
  );
}
