import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getTemplate } from '@/lib/notifications/templates';

export default async function NotificationsPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) return null;

  const { data: notifications } = await supabase
    .from('notifications')
    .select()
    .is('deleted_at', null);

  return (
    <main>
      <h1>Notifications</h1>

      {notifications?.map((notification) => {
        const { title, body } = getTemplate(notification);

        return (
          <Link key={notification.id} href={`notifications/${notification.id}`}>
            {!notification.read_at && <span>Unread</span>}
            <p>{title}</p>
            <pre>{body}</pre>
          </Link>
        );
      })}
    </main>
  );
}
