import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "../../hooks/useTranslation";

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  content: string; // text content or data URL
}

interface ChatInputBarProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInputBar({ onSendMessage, isLoading }: ChatInputBarProps) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState(() => !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  ));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();

      if (file.type.startsWith("image/")) {
        reader.onload = (ev) => {
          setAttachedFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            size: file.size,
            content: ev.target?.result as string,
          }]);
        };
        reader.readAsDataURL(file);
      } else if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        reader.onload = (ev) => {
          setAttachedFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            size: file.size,
            content: ev.target?.result as string,
          }]);
        };
        reader.readAsText(file);
      } else {
        setAttachedFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          size: file.size,
          content: "",
        }]);
      }
    });
    e.target.value = "";
  };

  const removeFile = (idx: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSend = () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    let fullContent = input.trim();

    if (attachedFiles.length > 0) {
      const fileSection = attachedFiles.map(f => {
        if (f.type.startsWith("image/")) {
          return `[Imagen adjunta: ${f.name}]`;
        } else if (f.content) {
          return `[Archivo: ${f.name}]\n${f.content.substring(0, 2000)}${f.content.length > 2000 ? "..." : ""}`;
        }
        return `[Archivo adjunto: ${f.name}]`;
      }).join("\n\n");

      fullContent = fullContent ? `${fullContent}\n\n${fileSection}` : fileSection;
    }

    onSendMessage(fullContent);
    setInput("");
    setAttachedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <div className="px-4 pb-4 pt-2 bg-background/80 backdrop-blur-xl border-t border-border/50 sticky bottom-0 z-10">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* File chips */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {attachedFiles.map((f, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs">
                {f.type.startsWith("image/") ? (
                  <ImageIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                )}
                <span className="truncate max-w-[120px] font-medium">{f.name}</span>
                <span className="text-muted-foreground">{formatSize(f.size)}</span>
                <button onClick={() => removeFile(idx)} className="text-muted-foreground hover:text-foreground ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className={`relative flex items-end gap-2 bg-card border rounded-2xl px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-primary/50 transition-all ${isListening ? "border-primary ring-1 ring-primary" : "border-border"}`}>
          {/* Mic button */}
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full h-9 w-9 flex-shrink-0 mb-0.5 transition-colors ${
              isListening
                ? "text-primary bg-primary/10 hover:bg-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
            disabled={isLoading || !speechSupported}
            onClick={isListening ? stopListening : startListening}
            title={speechSupported ? (isListening ? "Detener grabación" : "Dictar mensaje") : "Micrófono no disponible"}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 animate-pulse" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          {/* File attach button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9 flex-shrink-0 mb-0.5 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            title="Adjuntar archivo"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.txt,.md,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Escuchando..." : t("inputPlaceholder")}
            className="min-h-[36px] max-h-[180px] resize-none border-0 focus-visible:ring-0 px-1 py-2 bg-transparent text-sm"
            disabled={isLoading}
            rows={1}
          />

          <Button
            onClick={handleSend}
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
            size="icon"
            className="rounded-full h-9 w-9 flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground mb-0.5"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {isListening && (
          <p className="text-center text-xs text-primary font-medium flex items-center justify-center gap-1.5">
            <span className="inline-flex gap-1">
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:100ms]" />
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:200ms]" />
            </span>
            Escuchando — habla ahora...
          </p>
        )}

        {!isListening && (
          <p className="text-center text-[10px] text-muted-foreground">
            {t("verifyInfo")}
          </p>
        )}
      </div>
    </div>
  );
}
