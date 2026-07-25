import { useState } from "react";
import { Plus, Settings, X, History, User as UserIcon, FileText, AlertTriangle, MessageSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useListConversations } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ConversationListItem } from "./ConversationListItem";
import { OnyxLogo } from "../common/OnyxLogo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReportErrorDialog } from "../common/ReportErrorDialog";
import { useTranslation } from "../../hooks/useTranslation";

interface ChatSidebarProps {
  onClose?: () => void;
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const [location, setLocation] = useLocation();
  const [reportOpen, setReportOpen] = useState(false);
  const { t } = useTranslation();
  const { data: conversations, isLoading } = useListConversations();

  const handleNewChat = () => {
    setLocation("/chat");
    if (onClose) onClose();
  };

  const activeId = location.startsWith("/chat/") ? parseInt(location.split("/").pop() || "0") : null;

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
      <div className="mb-4">
        <div className="text-[10px] font-semibold text-sidebar-foreground/35 uppercase tracking-widest mb-1.5 px-3">
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

  const isActive = (href: string) => location === href;

  const navItem = (href: string, icon: React.ReactNode, label: string) => (
    <Link href={href} onClick={onClose}>
      <button
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group
          ${isActive(href)
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
          }`}
      >
        <span className={`transition-colors ${isActive(href) ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"}`}>
          {icon}
        </span>
        {label}
      </button>
    </Link>
  );

  return (
    <div className="flex flex-col h-full bg-sidebar/95 backdrop-blur-2xl w-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <Link href="/chat" onClick={onClose}>
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 transition-colors">
              <OnyxLogo className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">ZerCX</span>
          </div>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground w-8 h-8 rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Nueva Conversación */}
      <div className="px-3 pb-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-[0_4px_16px_hsl(var(--primary)/0.35)] hover:bg-primary/90 hover:shadow-[0_4px_24px_hsl(var(--primary)/0.45)] transition-all duration-200 active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          {t("newConversation")}
        </button>
      </div>

      {/* Lista de conversaciones */}
      <ScrollArea className="flex-1 px-2">
        {isLoading ? (
          <div className="space-y-1.5 pt-1 px-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-8 animate-shimmer rounded-lg"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="pb-4 pt-1">
            {renderGroup(t("today"), today)}
            {renderGroup(t("yesterday"), yesterday)}
            {renderGroup(t("older"), older)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="w-10 h-10 rounded-2xl bg-sidebar-accent flex items-center justify-center animate-float">
              <MessageSquare className="w-5 h-5 text-sidebar-foreground/40" />
            </div>
            <p className="text-xs text-sidebar-foreground/40 max-w-[140px] leading-relaxed">
              {t("noConversations")}
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Separador sutil */}
      <div className="h-px mx-3 bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />

      {/* Navegación inferior */}
      <div className="p-3 pb-5 space-y-0.5">
        {navItem("/historial", <History className="w-4 h-4" />, t("fullHistory"))}
        {navItem("/configuracion", <Settings className="w-4 h-4" />, t("settings"))}
        {navItem("/perfil", <UserIcon className="w-4 h-4" />, t("profile"))}
        {navItem("/terminos", <FileText className="w-4 h-4" />, t("termsAndConditions"))}
        <button
          onClick={() => setReportOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-destructive/60 hover:text-destructive hover:bg-destructive/8"
        >
          <AlertTriangle className="w-4 h-4" />
          {t("reportError")}
        </button>
      </div>

      <ReportErrorDialog open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}
