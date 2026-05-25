import { Plus, Settings, Menu, X, History, User as UserIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useListConversations, useCreateConversation } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ConversationListItem } from "./ConversationListItem";
import { OnyxLogo } from "../common/OnyxLogo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ChatSidebarProps {
  onClose?: () => void;
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const [location, setLocation] = useLocation();
  const { data: conversations, isLoading } = useListConversations();
  const createMutation = useCreateConversation({
    mutation: {
      onSuccess: (data) => {
        setLocation(`/chat/${data.id}`);
        if (onClose) onClose();
      }
    }
  });

  const handleNewChat = () => {
    createMutation.mutate({ data: { title: "Nueva conversación" } });
  };

  const activeId = location.startsWith("/chat/") ? parseInt(location.split("/").pop() || "0") : null;

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-full">
      <div className="p-4 flex items-center justify-between">
        <Link href="/chat">
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

      <div className="px-3 pb-3">
        <Button 
          onClick={handleNewChat} 
          className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          disabled={createMutation.isPending}
        >
          <Plus className="w-4 h-4" />
          Nueva conversación
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 mb-4">
          <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2 mt-4">
            Recientes
          </div>
          {isLoading ? (
            <div className="space-y-2 px-2">
              <div className="h-10 bg-sidebar-accent/50 animate-pulse rounded-md"></div>
              <div className="h-10 bg-sidebar-accent/50 animate-pulse rounded-md"></div>
              <div className="h-10 bg-sidebar-accent/50 animate-pulse rounded-md"></div>
            </div>
          ) : conversations && conversations.length > 0 ? (
            conversations.slice(0, 20).map((conv) => (
              <ConversationListItem 
                key={conv.id} 
                conversation={conv} 
                isActive={activeId === conv.id} 
              />
            ))
          ) : (
            <div className="text-sm text-sidebar-foreground/50 px-2 py-4 text-center">
              No hay conversaciones
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />
      
      <div className="p-3 space-y-1">
        <Link href="/historial">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <History className="w-4 h-4" />
            Historial completo
          </Button>
        </Link>
        <Link href="/configuracion">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Settings className="w-4 h-4" />
            Configuración
          </Button>
        </Link>
        <Link href="/perfil">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <UserIcon className="w-4 h-4" />
            Perfil
          </Button>
        </Link>
      </div>
    </div>
  );
}
