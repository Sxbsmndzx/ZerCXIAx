import { useLocation } from "wouter";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { OnyxLogo } from "../components/common/OnyxLogo";
import { Image, PenTool, Search, Sparkles } from "lucide-react";
import { useCreateConversation } from "@workspace/api-client-react";
import { ChatInputBar } from "../components/chat/ChatInputBar";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "../contexts/AuthContext";
import crossPatternImg from "@assets/f9f9e019caf63180048b3af6ae9ccec3_1779830133596.jpg";

export default function ChatPage() {
  const { user } = useAuthGuard();
  const { user: authUser } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const createMutation = useCreateConversation({
    mutation: {
      onSuccess: (data) => {
        setLocation(`/chat/${data.id}`);
      },
    },
  });

  const handleSendMessage = (content: string) => {
    createMutation.mutate(
      { data: { title: "Nueva conversación" } },
      {
        onSuccess: (data) => {
          setLocation(`/chat/${data.id}?q=${encodeURIComponent(content)}`);
        },
      }
    );
  };

  const suggestionChips = [
    { icon: Image, text: t("createImage") },
    { icon: PenTool, text: t("writeOrEdit") },
    { icon: Search, text: t("searchInfo") },
    { icon: Sparkles, text: "Sorpréndeme" },
  ];

  if (!user) return null;

  const firstName = authUser?.name?.split(" ")[0] || "Usuario";

  return (
    <AppLayout>
      <div className="flex flex-col h-full relative overflow-hidden">
        {/* Patrón decorativo de fondo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${crossPatternImg})`,
            backgroundRepeat: "repeat",
            backgroundSize: "220px",
            opacity: 0.04,
          }}
        />

        {/* Contenido centrado con animaciones escalonadas */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full text-center relative z-10">

          {/* Logo con animación de entrada bounce */}
          <div
            className="mb-8 flex flex-col items-center animate-logo-in"
            style={{ animationDelay: "0ms" }}
          >
            <OnyxLogo className="w-32 h-32 drop-shadow-[0_0_32px_hsl(var(--primary)/0.4)]" />
          </div>

          {/* Saludo */}
          <h2
            className="text-2xl font-semibold mb-1 animate-text-in"
            style={{ animationDelay: "120ms" }}
          >
            {t("helpText")}
          </h2>
          <p
            className="text-muted-foreground text-sm mb-10 animate-text-in"
            style={{ animationDelay: "180ms" }}
          >
            Hola, <span className="text-foreground font-medium">{firstName}</span>. Estoy aquí para ayudarte.
          </p>

          {/* Chips de sugerencia con stagger iOS */}
          <div className="flex flex-wrap justify-center gap-2.5 w-full">
            {suggestionChips.map((chip, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="glass-panel hover:bg-secondary border-border/60 rounded-2xl py-5 px-5 gap-2.5 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all backdrop-blur-xl animate-chip-in"
                style={{ animationDelay: `${240 + idx * 70}ms` }}
                onClick={() => handleSendMessage(chip.text)}
                disabled={createMutation.isPending}
              >
                <chip.icon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm font-normal">{chip.text}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <ChatInputBar onSendMessage={handleSendMessage} isLoading={createMutation.isPending} />
        </div>
      </div>
    </AppLayout>
  );
}
