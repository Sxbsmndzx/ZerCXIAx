import { Message } from "@workspace/api-client-react";
import { UserAvatarBadge } from "../common/UserAvatarBadge";
import { useAuth } from "../../contexts/AuthContext";
import { OnyxLogo } from "../common/OnyxLogo";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "../../hooks/useTranslation";
import { useState } from "react";

interface ChatMessageBubbleProps {
  message: Message;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: t("copied"), description: "El mensaje ha sido copiado." });
  };

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-5`}>
      <div className={`flex max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-3`}>
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            user ? <UserAvatarBadge user={user} className="w-8 h-8 text-xs" /> : null
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
              <OnyxLogo className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-card border border-border text-foreground rounded-tl-sm shadow-sm"
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed text-[14px]">{message.content}</p>
          </div>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
            >
              {copied ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copied ? t("copied") : t("copy")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
