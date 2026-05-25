import { MessageSquare, MoreHorizontal, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
}

export function ConversationListItem({ conversation, isActive }: ConversationListItemProps) {
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
      }
    }
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate({ conversationId: conversation.id });
  };

  const formattedDate = conversation.lastMessageAt 
    ? format(new Date(conversation.lastMessageAt), "d MMM", { locale: es })
    : format(new Date(conversation.createdAt), "d MMM", { locale: es });

  return (
    <Link href={`/chat/${conversation.id}`}>
      <div className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-secondary/80 text-secondary-foreground' : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'}`}>
        <MessageSquare className="w-4 h-4 flex-shrink-0" />
        <div className="flex-1 min-w-0 overflow-hidden text-sm">
          <div className="truncate font-medium">{conversation.title}</div>
          <div className="text-[11px] opacity-70 mt-0.5 truncate">
            {formattedDate} • {conversation.messageCount} msjs
          </div>
        </div>
        
        <div className={`absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-background/80">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
