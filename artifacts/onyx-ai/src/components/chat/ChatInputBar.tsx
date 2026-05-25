import { useState, useRef, useEffect } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "../../hooks/useTranslation";

interface ChatInputBarProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInputBar({ onSendMessage, isLoading }: ChatInputBarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2 bg-background/80 backdrop-blur-xl border-t border-border/50 sticky bottom-0 z-10">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground mb-0.5"
            disabled={isLoading}
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder")}
            className="min-h-[36px] max-h-[200px] resize-none border-0 focus-visible:ring-0 px-1 py-2 bg-transparent text-sm"
            disabled={isLoading}
            rows={1}
          />

          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="rounded-full h-9 w-9 flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground mb-0.5 transition-all"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-1.5">
          {t("verifyInfo")}
        </p>
      </div>
    </div>
  );
}
