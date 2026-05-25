import { useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { OnyxLogo } from "../components/common/OnyxLogo";
import { Image, PenTool, Search } from "lucide-react";
import { useCreateConversation } from "@workspace/api-client-react";
import { ChatInputBar } from "../components/chat/ChatInputBar";

export default function ChatPage() {
  const { user } = useAuthGuard();
  const [, setLocation] = useLocation();

  const createMutation = useCreateConversation({
    mutation: {
      onSuccess: (data) => {
        setLocation(`/chat/${data.id}`);
      }
    }
  });

  const handleSendMessage = (content: string) => {
    // Actually in an empty state, this should create a conversation and maybe send the message
    // The API might expect creating first
    createMutation.mutate({ data: { title: content.substring(0, 40) } }, {
      onSuccess: (data) => {
        // Just redirect, ConversationPage will handle sending the message if we passed it in URL state or similar, 
        // but for simplicity let's redirect to empty conversation and user can type again, or better yet,
        // we should create the conversation with an initial message. But the API has a separate sendMessage endpoint.
        // Let's redirect with the content as a hash/query param or just redirect.
        setLocation(`/chat/${data.id}?q=${encodeURIComponent(content)}`);
      }
    });
  };

  const suggestionChips = [
    { icon: Image, text: "Crea una imagen" },
    { icon: PenTool, text: "Escribe o edita" },
    { icon: Search, text: "Busca información" },
  ];

  if (!user) return null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full items-center justify-center relative">
        <div className="flex-1 w-full flex flex-col items-center justify-center p-4 max-w-3xl mx-auto text-center">
          <OnyxLogo className="w-16 h-16 text-primary/80 mb-6" />
          <h2 className="text-2xl font-medium mb-8 text-foreground">¿En qué puedo ayudarte hoy?</h2>
          
          <div className="flex flex-wrap justify-center gap-3 w-full">
            {suggestionChips.map((chip, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                className="bg-card hover:bg-secondary border-border rounded-full py-6 px-6 gap-3 shadow-sm hover:shadow-md transition-all"
                onClick={() => handleSendMessage(chip.text)}
                disabled={createMutation.isPending}
              >
                <chip.icon className="w-5 h-5 text-primary" />
                <span className="text-base font-normal">{chip.text}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="w-full">
          <ChatInputBar onSendMessage={handleSendMessage} isLoading={createMutation.isPending} />
        </div>
      </div>
    </AppLayout>
  );
}
