import { useState } from "react";
import { Plus, Settings, X, History, User as UserIcon, AlertTriangle, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useListConversations } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ConversationListItem } from "./ConversationListItem";
import { OnyxLogo } from "../common/OnyxLogo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

  // Group by date
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

  const navItem = (href: string, icon: React.ReactNode, label: string) => (
    <Link href={href} onClick={onClose}>
      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${location === href ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
      >
        {icon}
        {label}
      </Button>
    </Link>
  );

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

        {/* New Chat */}
        <div className="px-3 pb-3">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Plus className="w-4 h-4" />
            {t("newConversation")}
          </Button>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 px-3">
          {isLoading ? (
            <div className="space-y-1.5 pt-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-sidebar-accent/40 animate-pulse rounded-md" />
              ))}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="pb-4 pt-1">
              {renderGroup(t("today"), today)}
              {renderGroup(t("yesterday"), yesterday)}
              {renderGroup(t("older"), older)}
            </div>
          ) : (
            <div className="text-xs text-sidebar-foreground/50 px-2 py-6 text-center">
              {t("noConversations")}
            </div>
          )}
        </ScrollArea>

        <Separator className="bg-sidebar-border" />

        {/* Bottom nav */}
        <div className="p-3 space-y-0.5">
          {navItem("/historial", <History className="w-4 h-4" />, t("fullHistory"))}
          {navItem("/configuracion", <Settings className="w-4 h-4" />, t("settings"))}
          {navItem("/perfil", <UserIcon className="w-4 h-4" />, t("profile"))}
          {navItem("/terminos", <FileText className="w-4 h-4" />, t("termsAndConditions"))}
          <Button
            variant="ghost"
            onClick={() => setReportOpen(true)}
            className="w-full justify-start gap-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          >
            <AlertTriangle className="w-4 h-4" />
            {t("reportError")}
          </Button>
        </div>
      </div>

      <ReportErrorDialog open={reportOpen} onOpenChange={setReportOpen} />
    </>
  );
}
