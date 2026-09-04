import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tables } from '@/lib/supabase/types';

function initials(name: string | null) {
  if (!name) return '?';

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function UserAvatar({
  name,
  avatar,
  className,
}: Pick<Tables<'users'>, 'name' | 'avatar'> & {
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {avatar && <AvatarImage src={avatar} alt={name ?? ''} />}
      <AvatarFallback className="text-[length:inherit]">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
