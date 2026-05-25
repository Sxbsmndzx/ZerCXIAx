import { useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useGetConversation, getGetConversationQueryKey, useSendMessage } from "@workspace/api-client-react";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { ChatMessageBubble } from "../components/chat/ChatMessageBubble";
import { ChatInputBar } from "../components/chat/ChatInputBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";

export default function ConversationPage() {
  const { user } = useAuthGuard();
  const params = useParams();
  const [location] = useLocation();
  const conversationId = parseInt(params.id || "0");
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversation, isLoading } = useGetConversation(conversationId, {
    query: {
      enabled: !!conversationId,
      queryKey: getGetConversationQueryKey(conversationId)
    }
  });

  const sendMutation = useSendMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(conversationId) });
      }
    }
  });

  // Handle auto-send if arrived with query param 'q'
  useEffect(() => {
    if (location.includes("?q=")) {
      const q = new URLSearchParams(location.split("?")[1]).get("q");
      if (q && !sendMutation.isPending && (!conversation?.messages || conversation.messages.length === 0)) {
        // Note: The wouter location hooks are simple. 
        // We'll strip the query param visually but actually it's easier to just trigger it once.
        sendMutation.mutate({ conversationId, data: { content: q } });
        // remove query param using history to avoid re-renders
        window.history.replaceState({}, '', `/chat/${conversationId}`);
      }
    }
  }, [location, conversationId, conversation]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);

  const handleSendMessage = (content: string) => {
    sendMutation.mutate({ conversationId, data: { content } });
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full relative">
        <ScrollArea className="flex-1 px-4 py-6 md:px-8">
          <div className="max-w-3xl mx-auto pb-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full pt-20">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            ) : conversation?.messages && conversation.messages.length > 0 ? (
              conversation.messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))
            ) : (
              <div className="text-center text-muted-foreground pt-20">
                Inicia la conversación
              </div>
            )}
            {sendMutation.isPending && (
              <div className="flex justify-start mb-6">
                <div className="flex gap-4 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                     <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-card border border-border rounded-tl-sm text-muted-foreground text-sm">
                    Escribiendo...
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        <div className="w-full">
          <ChatInputBar onSendMessage={handleSendMessage} isLoading={sendMutation.isPending} />
        </div>
      </div>
    </AppLayout>
  );
}
