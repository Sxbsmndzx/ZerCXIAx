import { useState, useRef, useEffect } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputBarProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInputBar({ onSendMessage, isLoading }: ChatInputBarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 sticky bottom-0 z-10">
      <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-card border border-border rounded-2xl p-2 shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-foreground"
          disabled={isLoading}
        >
          <Mic className="h-5 w-5" />
        </Button>
        
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Envía un mensaje a Onyx..."
          className="min-h-[40px] max-h-[200px] resize-none border-0 focus-visible:ring-0 px-2 py-3 bg-transparent text-base"
          disabled={isLoading}
          rows={1}
        />
        
        <Button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="rounded-full h-10 w-10 flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      <div className="text-center mt-2">
        <span className="text-[10px] text-muted-foreground">
          Onyx puede cometer errores. Considera verificar la información importante.
        </span>
      </div>
    </div>
  );
}
