import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getTemplate } from '@/lib/notifications/templates';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import { cn } from '@/lib/utils/tailwind';
import { Separator } from '@/components/ui/separator';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { PageHeader } from '@/components/common/page-header';
import { IconBell } from '@tabler/icons-react';

export default async function NotificationsPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) return null;

  const { data: notifications } = await supabase
    .from('notifications')
    .select()
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Notifications" />

      {notifications?.length ? (
        <ul className="mt-4 px-4">
          {notifications.map((notification, index) => {
            const { title, body } = getTemplate(notification);

            return (
              <li key={notification.id}>
                {index > 0 && <Separator />}
                <Link
                  href={`/notifications/${notification.id}`}
                  className="flex items-center gap-3 py-3 transition-colors active:text-muted-foreground"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      notification.read_at ? 'bg-transparent' : 'bg-primary',
                    )}
                  />
                  {!notification.read_at && (
                    <span className="sr-only">Unread</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {body}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(notification.created_at)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconBell />
            </EmptyMedia>
            <EmptyTitle>No notifications</EmptyTitle>
            <EmptyDescription className="max-w-xs text-pretty">
              You&apos;re all caught up. New notifications will appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </main>
  );
}
