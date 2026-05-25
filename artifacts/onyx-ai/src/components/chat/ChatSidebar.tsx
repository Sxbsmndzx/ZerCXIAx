import { useState } from "react";
import { Plus, Settings, X, History, User as UserIcon, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useListConversations, useCreateConversation } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ConversationListItem } from "./ConversationListItem";
import { OnyxLogo } from "../common/OnyxLogo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ReportErrorDialog } from "../common/ReportErrorDialog";

interface ChatSidebarProps {
  onClose?: () => void;
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const [location, setLocation] = useLocation();
  const [reportOpen, setReportOpen] = useState(false);
  const { data: conversations, isLoading } = useListConversations();
  const createMutation = useCreateConversation({
    mutation: {
      onSuccess: (data) => {
        setLocation(`/chat/${data.id}`);
        if (onClose) onClose();
      },
    },
  });

  const handleNewChat = () => {
    setLocation("/chat");
    if (onClose) onClose();
  };

  const activeId = location.startsWith("/chat/") ? parseInt(location.split("/").pop() || "0") : null;

  // Group conversations by date
  const today: typeof conversations = [];
  const yesterday: typeof conversations = [];
  const older: typeof conversations = [];

  if (conversations) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);

    conversations.forEach((conv) => {
      const d = new Date(conv.createdAt);
      if (d >= startOfToday) today.push(conv);
      else if (d >= startOfYesterday) yesterday.push(conv);
      else older.push(conv);
    });
  }

  const renderGroup = (label: string, items: typeof conversations) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-3">
        <div className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-1 px-2">
          {label}
        </div>
        {items.map((conv) => (
          <ConversationListItem
            key={conv.id}
            conversation={conv}
            isActive={activeId === conv.id}
            onNavigate={onClose}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-full">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <Link href="/chat" onClick={onClose}>
            <div className="flex items-center gap-2 font-semibold text-lg cursor-pointer hover:opacity-80 transition-opacity">
              <OnyxLogo className="w-6 h-6 text-primary" />
              <span>Onyx</span>
            </div>
          </Link>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-sidebar-foreground">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="px-3 pb-3">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Plus className="w-4 h-4" />
            Nueva conversación
          </Button>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 px-3">
          {isLoading ? (
            <div className="space-y-2 px-2 mt-2">
              <div className="h-8 bg-sidebar-accent/50 animate-pulse rounded-md" />
              <div className="h-8 bg-sidebar-accent/50 animate-pulse rounded-md" />
              <div className="h-8 bg-sidebar-accent/50 animate-pulse rounded-md" />
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="pb-4 pt-1">
              {renderGroup("Hoy", today)}
              {renderGroup("Ayer", yesterday)}
              {renderGroup("Anteriores", older)}
            </div>
          ) : (
            <div className="text-sm text-sidebar-foreground/50 px-2 py-6 text-center">
              No hay conversaciones aún
            </div>
          )}
        </ScrollArea>

        <Separator className="bg-sidebar-border" />

        {/* Bottom nav */}
        <div className="p-3 space-y-1">
          <Link href="/historial" onClick={onClose}>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${location === "/historial" ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
            >
              <History className="w-4 h-4" />
              Historial completo
            </Button>
          </Link>
          <Link href="/configuracion" onClick={onClose}>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${location === "/configuracion" ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
            >
              <Settings className="w-4 h-4" />
              Configuración
            </Button>
          </Link>
          <Link href="/perfil" onClick={onClose}>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${location === "/perfil" ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
            >
              <UserIcon className="w-4 h-4" />
              Perfil
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => setReportOpen(true)}
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <AlertTriangle className="w-4 h-4 text-destructive/70" />
            Informar error
          </Button>
        </div>
      </div>

      <ReportErrorDialog open={reportOpen} onOpenChange={setReportOpen} />
    </>
  );
}
