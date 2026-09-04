import { createClient } from '@/lib/supabase/server';
import { type Tables } from '@/lib/supabase/types';
import { HangoutState } from '@/app/hangouts/[id]/state';
import { PageHeader } from '@/components/common/page-header';
import { Share } from '@/components/common/share';
import { MemberList, type MemberListItem } from './member-list';

export default async function HangoutMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;

  const { data: hangout } = await supabase
    .from('hangouts')
    .select('creator_id, ended_at, creator:users!hangouts_creator_id_fkey(*)')
    .eq('id', id)
    .maybeSingle();

  if (!hangout) return null;

  const isActive = hangout.creator_id === auth.claims.sub && !hangout.ended_at;

  async function shareHangout(token: string) {
    'use server';
    const supabase = await createClient();
    return supabase.from('hangout_shares').insert({ id, token });
  }

  const [
    { data: members },
    { data: requests },
    { data: invites },
    { data: buddies },
  ] = await Promise.all([
    supabase
      .from('hangout_members')
      .select('user:users!inner(*)')
      .order('created_at', { ascending: false })
      .eq('hangout_id', id),
    isActive
      ? supabase
          .from('hangout_requests')
          .select('user:users!inner(*)')
          .order('created_at', { ascending: false })
          .eq('hangout_id', id)
      : { data: [] },
    isActive
      ? supabase
          .from('hangout_invites')
          .select('user:users!inner(*)')
          .order('created_at', { ascending: false })
          .eq('hangout_id', id)
      : { data: [] },
    isActive
      ? supabase
          .from('my_buddies')
          .select()
          .order('created_at', { ascending: false })
      : { data: [] },
  ]);

  const items: MemberListItem[] = [];
  const listed = new Set<string>();

  function add(type: HangoutState, users: Tables<'users'>[]) {
    for (const user of users) {
      if (listed.has(user.id)) continue;
      listed.add(user.id);
      items.push({ type, user });
    }
  }

  add(
    HangoutState.Requested,
    (requests ?? []).map(({ user }) => user),
  );
  add(
    HangoutState.Invited,
    (invites ?? []).map(({ user }) => user),
  );
  add(HangoutState.Creator, [hangout.creator]);
  add(
    HangoutState.Member,
    (members ?? []).map(({ user }) => user),
  );
  add(HangoutState.Initial, (buddies ?? []) as Tables<'users'>[]);

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Members">
        {isActive && (
          <Share
            path={`/hangouts/${id}/join`}
            title="Share hangout"
            onShare={shareHangout}
          />
        )}
      </PageHeader>

      <MemberList hangoutId={id} isActive={isActive} items={items} />
    </main>
  );
}
