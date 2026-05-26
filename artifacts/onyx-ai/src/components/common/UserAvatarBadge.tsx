import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@workspace/api-client-react";

interface UserAvatarBadgeProps {
  user: User;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatarBadge({ user, className, fallbackClassName }: UserAvatarBadgeProps) {
  const initials = user.avatarInitials || user.name.substring(0, 2).toUpperCase();
  const avatarUrl = (user as any).avatarUrl as string | null | undefined;

  return (
    <Avatar className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} className="object-cover" />}
      <AvatarFallback className={`bg-primary/20 text-primary font-semibold ${fallbackClassName || ""}`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
