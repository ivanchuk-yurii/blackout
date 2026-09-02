import { createClient } from '@/lib/supabase/server';
import { BuddyState } from '@/app/buddies/[id]/state';
import { PageHeader } from '@/components/common/page-header';
import { BuddyList, type BuddyListItem } from './buddy-list';
import { type Tables } from '@/lib/supabase/types';

export default async function BuddiesPage() {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;

  const [{ data: buddies }, { data: requests }, { data: invites }] =
    await Promise.all([
      supabase
        .from('my_buddies')
        .select()
        .order('created_at', { ascending: false }),
      supabase
        .from('buddy_requests')
        .select('buddy:users!buddy_requests_buddy_id_fkey(*)')
        .eq('user_id', auth.claims.sub)
        .order('created_at', { ascending: false }),
      supabase
        .from('buddy_requests')
        .select('user:users!buddy_requests_user_id_fkey(*)')
        .eq('buddy_id', auth.claims.sub)
        .order('created_at', { ascending: false }),
    ]);

  const items: BuddyListItem[] = [
    ...(invites ?? []).map(({ user }) => ({
      type: BuddyState.Invited,
      user,
    })),
    ...(requests ?? []).map(({ buddy }) => ({
      type: BuddyState.Requested,
      user: buddy,
    })),
    ...(buddies ?? []).map((buddy) => ({
      type: BuddyState.Buddies,
      user: buddy as Tables<'users'>,
    })),
  ];

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Buddies" />

      <BuddyList userId={auth.claims.sub} initialItems={items} />
    </main>
  );
}
