// PÁGINA DE CONVERSACIÓN
// Muestra los mensajes de un chat activo con ZerCX AI.
// Lee el primer mensaje directamente de window.location.search (más confiable que wouter)
// y lo envía inmediatamente sin esperar a que cargue la conversación.
import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import {
  useGetConversation,
  getGetConversationQueryKey,
  getListConversationsQueryKey,
  useSendMessage,
} from "@workspace/api-client-react";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { ChatMessageBubble } from "../components/chat/ChatMessageBubble";
import { ChatInputBar } from "../components/chat/ChatInputBar";
import { useQueryClient } from "@tanstack/react-query";
import { OnyxLogo } from "../components/common/OnyxLogo";
import { useTranslation } from "../hooks/useTranslation";
import { Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { UserAvatarBadge } from "../components/common/UserAvatarBadge";

export default function ConversationPage() {
  const { user } = useAuthGuard();
  const { user: authUser } = useAuth();
  const params = useParams();
  const conversationId = parseInt(params.id || "0");
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasSentRef = useRef(false);
  const { t } = useTranslation();

  const [sugerencias, setSugerencias] = useState<string[]>([]);
  // Muestra el mensaje del usuario al instante antes de que el servidor responda
  const [mensajeOptimista, setMensajeOptimista] = useState<string | null>(null);

  const { data: conversation, isLoading } = useGetConversation(conversationId, {
    query: {
      enabled: !!conversationId,
      queryKey: getGetConversationQueryKey(conversationId),
    },
  });

  const sendMutation = useSendMessage({
    mutation: {
      onSuccess: (data: any) => {
        setMensajeOptimista(null);
        if (data?.sugerencias?.length) setSugerencias(data.sugerencias);
        else setSugerencias([]);
        queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(conversationId) });
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
      },
      onError: () => setMensajeOptimista(null),
    },
  });

  // Lee el primer mensaje de window.location.search (NO de wouter — wouter puede no incluir query params)
  // y envía el mensaje INMEDIATAMENTE al montar la página sin esperar la carga de la conversación
  useEffect(() => {
    if (hasSentRef.current) return;
    if (!conversationId) return;

    // Leer directamente de la URL del navegador
    const q = new URLSearchParams(window.location.search).get("q");
    if (!q) return;

    hasSentRef.current = true;
    setMensajeOptimista(q);
    sendMutation.mutate({ conversationId, data: { content: q } });
    // Limpiar ?q= de la URL sin recargar la página
    window.history.replaceState({}, "", window.location.pathname);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, sendMutation.isPending, mensajeOptimista]);

  const handleSendMessage = (content: string) => {
    setSugerencias([]);
    sendMutation.mutate({ conversationId, data: { content } });
  };

  const handleSugerencia = (texto: string) => {
    setSugerencias([]);
    handleSendMessage(texto);
  };

  if (!user) return null;

  const hayMensajes = conversation?.messages && conversation.messages.length > 0;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Título generado por la IA — solo visible cuando ya no es el placeholder */}
        {conversation?.title && conversation.title !== "Nueva conversación" && (
          <div className="px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm text-sm font-medium text-muted-foreground truncate text-center flex-shrink-0">
            {conversation.title}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 md:px-6">
            {isLoading && !mensajeOptimista ? (
              <div className="flex items-center justify-center pt-20">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : hayMensajes ? (
              conversation.messages.map((msg, idx) => (
                <ChatMessageBubble key={msg.id} message={msg} index={idx} />
              ))
            ) : mensajeOptimista ? (
              // Mensaje optimista: aparece inmediatamente mientras el servidor procesa
              <div className="flex w-full justify-end mb-5">
                <div className="flex max-w-[85%] flex-row-reverse items-end gap-2.5">
                  <div className="flex-shrink-0 mb-1">
                    {authUser && <UserAvatarBadge user={authUser} className="w-7 h-7 text-xs" />}
                  </div>
                  <div className="px-5 py-3.5 text-[14px] leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground rounded-[28px] rounded-tr-[6px] shadow-lg shadow-primary/20">
                    {mensajeOptimista}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-20 gap-4 text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <OnyxLogo className="w-7 h-7" />
                </div>
                <p className="text-sm">{t("startConversation")}</p>
              </div>
            )}

            {sendMutation.isPending && (
              <div className="flex justify-start mb-6">
                <div className="flex gap-3 max-w-[85%] items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <OnyxLogo className="w-4 h-4" />
                  </div>
                  <div className="px-5 py-3.5 rounded-[28px] rounded-tl-[6px] bg-card/90 backdrop-blur-sm border border-border/60 text-muted-foreground text-sm flex items-center gap-2 shadow-lg">
                    <span className="inline-flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                    </span>
                    {t("typing")}
                  </div>
                </div>
              </div>
            )}

            {sugerencias.length > 0 && !sendMutation.isPending && (
              <div className="mb-4 pl-11">
                <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>{t("suggestions")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sugerencias.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSugerencia(sug)}
                      className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-foreground hover:bg-primary/15 hover:border-primary/60 transition-all text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <ChatInputBar onSendMessage={handleSendMessage} isLoading={sendMutation.isPending} />
      </div>
    </AppLayout>
  );
}
