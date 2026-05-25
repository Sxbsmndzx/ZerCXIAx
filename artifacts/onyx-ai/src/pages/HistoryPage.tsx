import { useAuthGuard } from "../hooks/useAuthGuard";
import { AppLayout } from "../components/layout/AppLayout";
import {
  useListConversations,
  useGetStatsOverview,
  useListSavedPrompts,
  useDeleteConversation,
  getListConversationsQueryKey,
} from "@workspace/api-client-react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, Plus, Trash2, Bookmark, MessagesSquare, Clock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "../hooks/useTranslation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type Conversation = { id: number; title: string; createdAt: string; messageCount: number; lastMessageAt?: string | null };

export default function HistoryPage() {
  const { user } = useAuthGuard();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: conversations, isLoading } = useListConversations();
  const { data: stats } = useGetStatsOverview();
  const { data: savedPrompts } = useListSavedPrompts();

  const deleteMutation = useDeleteConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        toast({ title: t("deletedSuccessfully") });
      },
    },
  });

  if (!user) return null;

  const grouped: Record<string, Conversation[]> = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };

  if (conversations) {
    conversations.forEach((conv) => {
      const d = new Date(conv.createdAt);
      if (isToday(d)) grouped.today.push(conv);
      else if (isYesterday(d)) grouped.yesterday.push(conv);
      else if (differenceInDays(new Date(), d) <= 7) grouped.lastWeek.push(conv);
      else grouped.older.push(conv);
    });
  }

  const renderGroup = (labelKey: "today" | "yesterday" | "lastWeek" | "older", items: Conversation[]) => {
    if (items.length === 0) return null;
    const labels = { today: t("today"), yesterday: t("yesterday"), lastWeek: t("lastWeek"), older: t("older") };
    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          {labels[labelKey]}
        </h3>
        <div className="space-y-1">
          {items.map((conv) => (
            <div
              key={conv.id}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
              onClick={() => setLocation(`/chat/${conv.id}`)}
            >
              <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{conv.title}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{format(new Date(conv.createdAt), "d MMM yyyy", { locale: es })}</span>
                  <span>·</span>
                  <span>{conv.messageCount} {t("messages")}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate({ conversationId: conv.id });
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                title={t("deleteConversation")}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-5 md:px-6 border-b border-border/50 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold">{t("history")}</h1>
          <Link href="/chat">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              {t("newConversation")}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="px-4 py-4 md:px-6 grid grid-cols-3 gap-3 flex-shrink-0 border-b border-border/50">
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{stats?.totalConversations ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t("totalConversations")}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{stats?.totalMessages ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t("totalMessages")}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{stats?.conversationsToday ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t("todayCount")}</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 md:px-6 max-w-3xl mx-auto">

            {/* Saved Prompts */}
            {savedPrompts && savedPrompts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  {t("savedPrompts")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedPrompts.map((prompt) => (
                    <div key={prompt.id} className="bg-card border border-border rounded-lg p-3 hover:bg-secondary/30 transition-colors cursor-pointer">
                      <div className="text-sm font-medium truncate">{prompt.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{prompt.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conversations */}
            {isLoading ? (
              <div className="space-y-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-secondary/40 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <MessagesSquare className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">No hay conversaciones</p>
                  <p className="text-xs text-muted-foreground">¡Empieza una nueva conversación!</p>
                </div>
                <Link href="/chat">
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t("newConversation")}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {renderGroup("today", grouped.today)}
                {renderGroup("yesterday", grouped.yesterday)}
                {renderGroup("lastWeek", grouped.lastWeek)}
                {renderGroup("older", grouped.older)}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
