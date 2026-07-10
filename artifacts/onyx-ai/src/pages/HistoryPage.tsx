import { useAuthGuard } from "../hooks/useAuthGuard";
import { AppLayout } from "../components/layout/AppLayout";
import {
  useListConversations,
  useGetStatsOverview,
  useListSavedPrompts,
  useDeleteConversation,
  getListConversationsQueryKey,
} from "@workspace/api-client-react";
import { formatDistanceToNow, isToday, isYesterday, differenceInDays } from "date-fns";
import { es, enUS, pt, fr, de, type Locale } from "date-fns/locale";
import { MessageSquare, Plus, Search, Bookmark, Code2, Sparkles, ChevronRight, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "../hooks/useTranslation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const LOCALE_MAP: Record<string, Locale> = { es, en: enUS, pt, fr, de };

type Conv = { id: number; title: string; createdAt: string; messageCount: number; lastMessageAt?: string | null; lastMessagePreview?: string | null };

function ConvCard({ conv, onDelete, locale }: { conv: Conv; onDelete: (id: number) => void; locale: Locale }) {
  const [, setLocation] = useLocation();
  const date = new Date(conv.lastMessageAt || conv.createdAt);
  const timeAgo = formatDistanceToNow(date, { addSuffix: false, locale });

  return (
    <div
      onClick={() => setLocation(`/chat/${conv.id}`)}
      className="flex items-center gap-3 p-4 bg-card border border-border/60 rounded-xl mb-2 cursor-pointer hover:bg-secondary/40 active:scale-[0.99] transition-all group"
    >
      <div className="w-11 h-11 rounded-xl bg-secondary border border-border/40 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-sm text-foreground leading-tight line-clamp-1">{conv.title}</span>
          <span className="text-[11px] text-muted-foreground flex-shrink-0 mt-0.5">hace {timeAgo}</span>
        </div>
        {conv.lastMessagePreview && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{conv.lastMessagePreview}</p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all flex-shrink-0 text-muted-foreground"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 -ml-1" />
    </div>
  );
}

function OlderCard({ conv, onDelete, locale }: { conv: Conv; onDelete: (id: number) => void; locale: Locale }) {
  const [, setLocation] = useLocation();
  const date = new Date(conv.createdAt);
  const daysAgo = differenceInDays(new Date(), date);
  const label = isYesterday(date) ? "Ayer" : `hace ${daysAgo} días`;

  return (
    <div
      onClick={() => setLocation(`/chat/${conv.id}`)}
      className="flex items-center gap-3 p-4 bg-card border border-border/60 rounded-xl mb-2 cursor-pointer hover:bg-secondary/40 active:scale-[0.99] transition-all group"
    >
      <div className="w-11 h-11 rounded-xl bg-secondary border border-border/40 flex items-center justify-center flex-shrink-0">
        <MessageSquare className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-sm text-foreground line-clamp-1">{conv.title}</span>
          <span className="text-[11px] text-muted-foreground flex-shrink-0 mt-0.5">{label}</span>
        </div>
        {conv.lastMessagePreview && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{conv.lastMessagePreview}</p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all flex-shrink-0 text-muted-foreground"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 -ml-1" />
    </div>
  );
}

export default function HistoryPage() {
  const { user } = useAuthGuard();
  const { t, lang } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: conversations, isLoading } = useListConversations();
  const { data: savedPrompts } = useListSavedPrompts();

  const locale = LOCALE_MAP[lang] || es;

  const deleteMutation = useDeleteConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        toast({ title: t("deletedSuccessfully") });
      },
    },
  });

  const handleDelete = (id: number) => deleteMutation.mutate({ conversationId: id });

  if (!user) return null;

  const filtered = conversations
    ? searchQuery
      ? conversations.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : conversations
    : [];

  const recent = filtered.filter(c => isToday(new Date(c.createdAt)));
  const yesterday = filtered.filter(c => isYesterday(new Date(c.createdAt)));
  const older = filtered.filter(c => {
    const d = new Date(c.createdAt);
    return !isToday(d) && !isYesterday(d);
  });

  const PROMPT_ICONS = [Bookmark, Code2, Sparkles, MessageSquare];

  return (
    <AppLayout>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-6 pb-3 flex-shrink-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h1 className="text-3xl font-bold">{t("history")}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Tus sesiones pasadas con ZerCX AI</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full mt-1"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {showSearch && (
            <div className="mt-3">
              <Input
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="px-4">
            {isLoading ? (
              <div className="space-y-2 mt-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-[72px] bg-card border border-border/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* CONVERSACIONES RECIENTES */}
                {recent.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                      Conversaciones recientes
                    </h3>
                    {recent.map(conv => (
                      <ConvCard key={conv.id} conv={conv} onDelete={handleDelete} locale={locale} />
                    ))}
                  </div>
                )}

                {/* PROMPTS GUARDADOS */}
                {savedPrompts && savedPrompts.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                        {t("savedPrompts")}
                      </h3>
                    </div>
                    {savedPrompts.map((prompt, idx) => {
                      const Icon = PROMPT_ICONS[idx % PROMPT_ICONS.length];
                      return (
                        <div
                          key={prompt.id}
                          className="flex items-center gap-3 p-4 bg-card border border-border/60 rounded-xl mb-2 cursor-pointer hover:bg-secondary/40 transition-all"
                        >
                          <div className="w-10 h-10 rounded-xl bg-secondary border border-border/40 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4.5 h-4.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm line-clamp-1">{prompt.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{prompt.content}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* AYER */}
                {yesterday.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                      {t("yesterday")}
                    </h3>
                    {yesterday.map(conv => (
                      <OlderCard key={conv.id} conv={conv} onDelete={handleDelete} locale={locale} />
                    ))}
                  </div>
                )}

                {/* ANTERIORES */}
                {older.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                      {t("older")}
                    </h3>
                    {older.map(conv => (
                      <OlderCard key={conv.id} conv={conv} onDelete={handleDelete} locale={locale} />
                    ))}
                  </div>
                )}

                {filtered.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                      <MessageSquare className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">No hay conversaciones</p>
                      <p className="text-sm text-muted-foreground mt-1">¡Empieza tu primera conversación!</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sticky bottom button */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
          <Link href="/chat" className="pointer-events-auto">
            <Button className="w-full h-12 rounded-2xl text-base gap-2 shadow-lg font-medium">
              <Plus className="w-5 h-5" />
              Nueva conversación
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
