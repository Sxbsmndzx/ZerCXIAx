// PÁGINA DE CONVERSACIÓN
// Muestra los mensajes de un chat activo con ZerCX AI.
// Incluye: historial de mensajes, burbuja de "escribiendo...",
// sugerencias de seguimiento, y barra de entrada de texto.
import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
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

export default function ConversationPage() {
  const { user } = useAuthGuard();
  const params = useParams();
  const [location] = useLocation();
  const conversationId = parseInt(params.id || "0");
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasSentRef = useRef(false);
  const { t } = useTranslation();

  // Sugerencias de preguntas de seguimiento generadas por la IA
  const [sugerencias, setSugerencias] = useState<string[]>([]);

  const { data: conversation, isLoading } = useGetConversation(conversationId, {
    query: {
      enabled: !!conversationId,
      queryKey: getGetConversationQueryKey(conversationId),
    },
  });

  const sendMutation = useSendMessage({
    mutation: {
      onSuccess: (data: any) => {
        // Captura las sugerencias de la respuesta de la IA
        if (data?.sugerencias?.length) {
          setSugerencias(data.sugerencias);
        } else {
          setSugerencias([]);
        }
        queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(conversationId) });
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
      },
    },
  });

  // Envía el mensaje inicial si viene de la pantalla principal (?q=...)
  useEffect(() => {
    if (!location.includes("?q=")) return;
    if (hasSentRef.current) return;
    if (sendMutation.isPending) return;
    if (!conversation) return;
    if (conversation.messages && conversation.messages.length > 0) return;

    const q = new URLSearchParams(location.split("?")[1]).get("q");
    if (q) {
      hasSentRef.current = true;
      sendMutation.mutate({ conversationId, data: { content: q } });
      window.history.replaceState({}, "", `/chat/${conversationId}`);
    }
  }, [location, conversationId, conversation]);

  // Auto-scroll al final cuando llegan mensajes nuevos
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, sendMutation.isPending]);

  const handleSendMessage = (content: string) => {
    setSugerencias([]); // Limpia sugerencias al enviar nuevo mensaje
    sendMutation.mutate({ conversationId, data: { content } });
  };

  // Al hacer clic en una sugerencia, se envía como mensaje
  const handleSugerencia = (texto: string) => {
    setSugerencias([]);
    handleSendMessage(texto);
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Título de la conversación */}
        {conversation?.title && (
          <div className="px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm text-sm font-medium text-muted-foreground truncate text-center flex-shrink-0">
            {conversation.title}
          </div>
        )}

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 md:px-6">
            {isLoading ? (
              <div className="flex items-center justify-center pt-20">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : conversation?.messages && conversation.messages.length > 0 ? (
              conversation.messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center pt-20 gap-4 text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <OnyxLogo className="w-7 h-7" />
                </div>
                <p className="text-sm">{t("startConversation")}</p>
              </div>
            )}

            {/* Indicador de "escribiendo..." mientras la IA responde */}
            {sendMutation.isPending && (
              <div className="flex justify-start mb-6">
                <div className="flex gap-3 max-w-[85%] items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <OnyxLogo className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border text-muted-foreground text-sm flex items-center gap-2">
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

            {/* Sugerencias de seguimiento — chips clicables debajo de la última respuesta */}
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
