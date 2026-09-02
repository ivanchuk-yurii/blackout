import Link from 'next/link';

import { Tables } from '@/lib/supabase/types';
import { UserAvatar } from '@/components/common/user-avatar';

export function UserListItem({
  children,
  ...user
}: Tables<'users'> & {
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Link
        href={`/buddies/${user.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <UserAvatar {...user} className="size-10 text-sm" />
        <span className="truncate font-medium">{user.name}</span>
      </Link>
      {children}
    </div>
  );
}
