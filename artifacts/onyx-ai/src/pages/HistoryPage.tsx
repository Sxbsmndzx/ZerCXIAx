import { useAuthGuard } from "../hooks/useAuthGuard";
import { AppLayout } from "../components/layout/AppLayout";
import { useListConversations, useGetStatsOverview, useListSavedPrompts } from "@workspace/api-client-react";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Calendar, Bookmark, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const { user } = useAuthGuard();
  
  const { data: conversations, isLoading: isLoadingConv } = useListConversations();
  const { data: stats } = useGetStatsOverview();
  const { data: savedPrompts } = useListSavedPrompts();

  if (!user) return null;

  // Group conversations
  const today: typeof conversations = [];
  const yesterday: typeof conversations = [];
  const older: typeof conversations = [];

  if (conversations) {
    conversations.forEach(conv => {
      const date = new Date(conv.createdAt);
      if (isToday(date)) today.push(conv);
      else if (isYesterday(date)) yesterday.push(conv);
      else older.push(conv);
    });
  }

  const renderGroup = (title: string, items: typeof conversations) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground tracking-wide mb-4 px-2">{title}</h3>
        <div className="space-y-2">
          {items.map(conv => (
            <Link key={conv.id} href={`/chat/${conv.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:bg-secondary/50 hover:border-border cursor-pointer transition-all group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{conv.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(conv.createdAt), "d MMM yyyy", { locale: es })}</span>
                    <span>•</span>
                    <span>{conv.messageCount} mensajes</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Historial</h1>
            <Link href="/chat">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva conversación
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="text-muted-foreground text-sm font-medium mb-2">Total de conversaciones</div>
              <div className="text-3xl font-bold text-primary">{stats?.totalConversations || 0}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="text-muted-foreground text-sm font-medium mb-2">Mensajes totales</div>
              <div className="text-3xl font-bold text-primary">{stats?.totalMessages || 0}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="text-muted-foreground text-sm font-medium mb-2">Hoy</div>
              <div className="text-3xl font-bold text-primary">{stats?.conversationsToday || 0}</div>
            </div>
          </div>

          {savedPrompts && savedPrompts.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                Prompts Guardados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedPrompts.map(prompt => (
                  <div key={prompt.id} className="bg-secondary/30 border border-border rounded-xl p-4">
                    <h4 className="font-medium text-foreground mb-1">{prompt.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{prompt.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoadingConv ? (
            <div className="space-y-4">
              <div className="h-20 bg-secondary/50 animate-pulse rounded-xl"></div>
              <div className="h-20 bg-secondary/50 animate-pulse rounded-xl"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {renderGroup("Hoy", today)}
              {renderGroup("Ayer", yesterday)}
              {renderGroup("Anteriores", older)}
              
              {!conversations || conversations.length === 0 && (
                <div className="text-center py-20 text-muted-foreground bg-card border border-border rounded-xl border-dashed">
                  No hay conversaciones recientes
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </AppLayout>
  );
}
