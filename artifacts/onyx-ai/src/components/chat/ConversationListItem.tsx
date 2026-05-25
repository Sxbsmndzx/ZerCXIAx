import { MessageSquare, MoreHorizontal, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Conversation, useDeleteConversation, getListConversationsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onNavigate?: () => void;
}

export function ConversationListItem({ conversation, isActive, onNavigate }: ConversationListItemProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useDeleteConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        if (isActive) {
          setLocation("/chat");
        }
        toast({
          title: "Conversación eliminada",
          description: "La conversación ha sido eliminada permanentemente.",
        });
      },
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate({ conversationId: conversation.id });
  };

  return (
    <Link href={`/chat/${conversation.id}`} onClick={onNavigate}>
      <div
        className={`group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "hover:bg-sidebar-accent/60 text-sidebar-foreground/70 hover:text-sidebar-foreground"
        }`}
      >
        <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="truncate">{conversation.title}</div>
        </div>

        <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-background/80">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Link>
  );
}
