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
      { data: { title: content.substring(0, 50) } },
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
  ];

  if (!user) return null;

  const firstName = authUser?.name?.split(" ")[0] || "Usuario";

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <OnyxLogo className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl font-semibold mb-1">
            {t("helpText")}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Hola, <span className="text-foreground font-medium">{firstName}</span>. Estoy aquí para ayudarte.
          </p>

          <div className="flex flex-wrap justify-center gap-2 w-full">
            {suggestionChips.map((chip, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="bg-card hover:bg-secondary border-border rounded-xl py-5 px-5 gap-2.5 shadow-sm hover:shadow transition-all"
                onClick={() => handleSendMessage(chip.text)}
                disabled={createMutation.isPending}
              >
                <chip.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-normal">{chip.text}</span>
              </Button>
            ))}
            <Button
              variant="outline"
              className="bg-card hover:bg-secondary border-border rounded-xl py-5 px-5 gap-2.5 shadow-sm hover:shadow transition-all"
              onClick={() => handleSendMessage("Sorpréndeme con algo interesante")}
              disabled={createMutation.isPending}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-normal">Sorpréndeme</span>
            </Button>
          </div>
        </div>

        <ChatInputBar onSendMessage={handleSendMessage} isLoading={createMutation.isPending} />
      </div>
    </AppLayout>
  );
}
