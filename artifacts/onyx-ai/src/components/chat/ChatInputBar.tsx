import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "../../hooks/useTranslation";

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  content: string;
}

interface ChatInputBarProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInputBar({ onSendMessage, isLoading }: ChatInputBarProps) {
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [sendAnim, setSendAnim] = useState(false);
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
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      if (file.type.startsWith("image/")) {
        reader.onload = (ev) => {
          setAttachedFiles(prev => [...prev, { name: file.name, type: file.type, size: file.size, content: ev.target?.result as string }]);
        };
        reader.readAsDataURL(file);
      } else if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        reader.onload = (ev) => {
          setAttachedFiles(prev => [...prev, { name: file.name, type: file.type, size: file.size, content: ev.target?.result as string }]);
        };
        reader.readAsText(file);
      } else {
        setAttachedFiles(prev => [...prev, { name: file.name, type: file.type, size: file.size, content: "" }]);
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
        if (f.type.startsWith("image/")) return `[Imagen adjunta: ${f.name}]`;
        if (f.content) return `[Archivo: ${f.name}]\n${f.content.substring(0, 2000)}${f.content.length > 2000 ? "..." : ""}`;
        return `[Archivo adjunto: ${f.name}]`;
      }).join("\n\n");
      fullContent = fullContent ? `${fullContent}\n\n${fileSection}` : fileSection;
    }

    // Animación del botón enviar
    setSendAnim(true);
    setTimeout(() => setSendAnim(false), 400);

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

  const canSend = (input.trim() || attachedFiles.length > 0) && !isLoading;

  return (
    <>
      {/* Overlay de voz pantalla completa */}
      {isListening && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl"
          onClick={stopListening}
        >
          <div className="flex flex-col items-center gap-8 p-8" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-center">
              <div className="absolute rounded-full border-2 border-primary/20 animate-ping-slow" style={{ width: "180px", height: "180px" }} />
              <div className="absolute rounded-full border-2 border-primary/35 animate-ping-medium" style={{ width: "130px", height: "130px" }} />
              <div className="absolute rounded-full border-2 border-primary/55 animate-ping-fast" style={{ width: "90px", height: "90px" }} />
              <button
                onClick={stopListening}
                className="relative z-10 w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-[0_0_60px_hsl(var(--primary)/0.7)] cursor-pointer"
              >
                <Mic className="w-8 h-8 text-primary-foreground" />
              </button>
            </div>
            <div className="flex items-end gap-1.5 h-12">
              {[...Array(11)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-primary rounded-full animate-sound-bar"
                  style={{ animationDelay: `${i * 70}ms`, animationDuration: `${550 + (i % 4) * 130}ms` }}
                />
              ))}
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-bold text-xl">Escuchando...</p>
              <p className="text-white/50 text-sm">Toca el micrófono para detener</p>
            </div>
          </div>
        </div>
      )}

      {/* Barra de entrada iOS-style */}
      <div className="px-4 pb-5 pt-2 sticky bottom-0 z-10">
        {/* Difuminado hacia arriba para separar el scroll del input */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-t from-transparent to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-2">
          {/* Archivos adjuntos */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1 animate-chip-in">
              {attachedFiles.map((f, idx) => (
                <div key={idx} className="flex items-center gap-1.5 glass-panel border border-border/50 rounded-xl px-3 py-1.5 text-xs">
                  {f.type.startsWith("image/")
                    ? <ImageIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    : <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  <span className="truncate max-w-[120px] font-medium">{f.name}</span>
                  <span className="text-muted-foreground">{formatSize(f.size)}</span>
                  <button onClick={() => removeFile(idx)} className="text-muted-foreground hover:text-foreground ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input principal — pill estilo iOS */}
          <div
            className={`ios-focus relative flex items-end gap-1.5 glass-panel rounded-3xl px-3 py-2 border transition-all ${
              isListening
                ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.2),0_0_24px_hsl(var(--primary)/0.15)]"
                : "border-border/60 hover:border-border"
            }`}
          >
            {/* Micrófono */}
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-9 w-9 flex-shrink-0 mb-0.5 transition-all ${
                isListening
                  ? "text-primary bg-primary/10 shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              disabled={isLoading || !speechSupported}
              onClick={isListening ? stopListening : startListening}
              title={speechSupported ? (isListening ? "Detener" : "Dictar mensaje") : "Micrófono no disponible"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            {/* Adjuntar */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 flex-shrink-0 mb-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              title="Adjuntar archivo"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <input ref={fileInputRef} type="file" multiple accept="image/*,.txt,.md,.pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />

            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("inputPlaceholder")}
              className="min-h-[36px] max-h-[180px] resize-none border-0 focus-visible:ring-0 px-1 py-2 bg-transparent text-sm leading-relaxed"
              disabled={isLoading}
              rows={1}
            />

            {/* Botón enviar — escala cuando hay contenido */}
            <Button
              onClick={handleSend}
              disabled={!canSend}
              size="icon"
              className={`rounded-full flex-shrink-0 mb-0.5 text-primary-foreground transition-all ${
                sendAnim ? "animate-send-bounce" : ""
              } ${
                canSend
                  ? "h-9 w-9 bg-primary shadow-[0_0_16px_hsl(var(--primary)/0.45)] hover:bg-primary/90 scale-100"
                  : "h-8 w-8 bg-muted text-muted-foreground scale-90 opacity-60"
              }`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-[10px] text-muted-foreground/60">
            {t("verifyInfo")}
          </p>
        </div>
      </div>
    </>
  );
}
