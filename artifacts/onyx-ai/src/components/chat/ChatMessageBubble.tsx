import { Message } from "@workspace/api-client-react";
import { UserAvatarBadge } from "../common/UserAvatarBadge";
import { useAuth } from "../../contexts/AuthContext";
import { OnyxLogo } from "../common/OnyxLogo";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageBubbleProps {
  message: Message;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: "Copiado al portapapeles",
      description: "El mensaje ha sido copiado.",
    });
  };

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`flex max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-4`}>
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            user ? <UserAvatarBadge user={user} className="w-8 h-8" /> : null
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
              <OnyxLogo className="w-5 h-5" />
            </div>
          )}
        </div>
        
        <div className={`relative flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
          <div 
            className={`px-4 py-3 rounded-2xl ${
              isUser 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "bg-card border border-border text-foreground rounded-tl-sm shadow-sm"
            }`}
          >
            <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
              {message.content}
            </div>
          </div>
          
          {!isUser && (
            <button 
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium ml-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
