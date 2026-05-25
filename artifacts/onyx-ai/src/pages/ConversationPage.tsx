import { useEffect, useRef } from "react";
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

export default function ConversationPage() {
  const { user } = useAuthGuard();
  const params = useParams();
  const [location] = useLocation();
  const conversationId = parseInt(params.id || "0");
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasSentRef = useRef(false);

  const { data: conversation, isLoading } = useGetConversation(conversationId, {
    query: {
      enabled: !!conversationId,
      queryKey: getGetConversationQueryKey(conversationId),
    },
  });

  const sendMutation = useSendMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(conversationId) });
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
      },
    },
  });

  // Auto-send message if arrived from new chat with ?q= param
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

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, sendMutation.isPending]);

  const handleSendMessage = (content: string) => {
    sendMutation.mutate({ conversationId, data: { content } });
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Conversation title bar */}
        {conversation?.title && (
          <div className="px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm text-sm font-medium text-muted-foreground truncate text-center lg:text-left">
            {conversation.title}
          </div>
        )}

        {/* Messages area */}
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
                  <OnyxLogo className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm">Escribe tu primer mensaje para comenzar</p>
              </div>
            )}

            {sendMutation.isPending && (
              <div className="flex justify-start mb-6">
                <div className="flex gap-3 max-w-[85%] items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <OnyxLogo className="w-4 h-4 text-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border text-muted-foreground text-sm flex items-center gap-2">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                    </span>
                    Escribiendo...
                  </div>
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
