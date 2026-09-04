import Link from 'next/link';
import { IconChevronRight } from '@tabler/icons-react';
import { type Tables } from '@/lib/supabase/types';
import { AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { UserAvatar } from '@/components/common/user-avatar';

export function Members({
  hangoutId,
  members,
  count = 3,
}: {
  hangoutId: string;
  members: Tables<'users'>[];
  count?: number;
}) {
  return (
    <Link
      href={`/hangouts/${hangoutId}/members`}
      className="flex items-center gap-2 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <AvatarGroup>
        {members.slice(0, count).map((member) => (
          <UserAvatar key={member.id} {...member} />
        ))}

        {members.length > count && (
          <AvatarGroupCount className="text-xs">
            +{members.length - count}
          </AvatarGroupCount>
        )}
      </AvatarGroup>

      <p className="text-xs text-foreground">
        {members.length} {members.length === 1 ? 'person' : 'people'}
      </p>

      <IconChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
