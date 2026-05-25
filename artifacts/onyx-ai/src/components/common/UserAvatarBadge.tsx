import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@workspace/api-client-react";

interface UserAvatarBadgeProps {
  user: User;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatarBadge({ user, className, fallbackClassName }: UserAvatarBadgeProps) {
  const initials = user.avatarInitials || user.name.substring(0, 2).toUpperCase();

  return (
    <Avatar className={className}>
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );
}
