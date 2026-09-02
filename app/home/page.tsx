import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { UserAvatar } from '@/components/common/user-avatar';
import { Notifications } from './notifications';
import { HangoutList } from './hangout-list';
import logo from '@/public/logo.png';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;

  const [{ data: user }, { count: notificationsCount }, { data: hangouts }] =
    await Promise.all([
      supabase.from('users').select().eq('id', auth.claims.sub).maybeSingle(),
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .is('read_at', null),
      supabase
        .from('hangouts_feed')
        .select()
        .order('started_at', { ascending: false }),
    ]);

  if (!user) return null;

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between p-4">
        <Image src={logo} alt="Blackout" width={99} height={24} priority />

        <div className="flex items-center gap-4">
          <Notifications count={notificationsCount ?? 0} />

          <Link href="/user" aria-label="Profile">
            <UserAvatar {...user} className="size-9" />
          </Link>
        </div>
      </header>

      <HangoutList hangouts={hangouts ?? []} />
    </main>
  );
}
