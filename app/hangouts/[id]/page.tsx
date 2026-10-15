import { createClient } from '@/lib/supabase/server';
import { type Tables } from '@/lib/supabase/types';
import { type MemberListItem } from './members/member-list';
import { SIGN_TTL, STACK_LIMIT } from './photo';
import { Hangout } from './hangout';
import { HangoutState } from './state';

export default async function HangoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;
  const userId = auth.claims.sub;

  const [
    { data: hangout },
    { data: profile },
    { data: members },
    { data: drinks },
    { data: hangoutDrinks },
    { data: files },
    { data: lastSpot },
    { data: lastGame },
  ] = await Promise.all([
    supabase
      .from('hangouts')
      .select('*, creator:users!hangouts_creator_id_fkey(*)')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('user_profiles').select().eq('id', userId).maybeSingle(),
    supabase
      .from('hangout_members')
      .select('user:users!inner(*)')
      .eq('hangout_id', id),
    supabase
      .from('drinks')
      .select()
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order('name'),
    supabase
      .from('hangout_drinks')
      .select('*, drink:drinks(*)')
      .eq('hangout_id', id)
      .eq('user_id', userId)
      .order('created_at'),
    supabase.storage.from('hangout-photos').list(id, {
      limit: STACK_LIMIT,
      sortBy: { column: 'created_at', order: 'desc' },
    }),
    supabase
      .from('spots')
      .select('name, lat, lon')
      .eq('hangout_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('truth_or_lie')
      .select('id, state, rounds')
      .eq('hangout_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!hangout) return null;

  const isCreator = hangout.creator_id === userId;
  const isEnded = !!hangout.ended_at;

  const participants = [
    hangout.creator,
    ...(members ?? []).map((member) => member.user),
  ];

  const paths = (files ?? []).map((file) => `${id}/${file.name}`);

  async function getState(): Promise<HangoutState> {
    if (isCreator) return HangoutState.Creator;

    const { data: invited } = await supabase
      .from('hangout_invites')
      .select()
      .eq('hangout_id', id)
      .eq('user_id', userId)
      .maybeSingle();
    if (invited) return HangoutState.Invited;

    const { data: requested } = await supabase
      .from('hangout_requests')
      .select()
      .eq('hangout_id', id)
      .eq('user_id', userId)
      .maybeSingle();
    if (requested) return HangoutState.Requested;

    const { data: member } = await supabase
      .from('hangout_members')
      .select()
      .eq('hangout_id', id)
      .eq('user_id', userId)
      .maybeSingle();
    if (member) return HangoutState.Member;

    return HangoutState.Initial;
  }

  const hasInvite = !hangoutDrinks?.length && isCreator && !isEnded;

  const [
    { data: signed },
    state,
    { data: leaderboard },
    { data: spots },
    { data: buddies },
    { data: invites },
  ] = await Promise.all([
    paths.length
      ? supabase.storage
          .from('hangout-photos')
          .createSignedUrls(paths, SIGN_TTL)
      : { data: [] },
    getState(),
    isEnded
      ? supabase
          .from('hangout_leaderboard')
          .select()
          .eq('hangout_id', id)
          .order('units', { ascending: false })
      : { data: [] },
    isEnded
      ? supabase
          .from('spots')
          .select('name, lat, lon')
          .eq('hangout_id', id)
          .order('created_at')
      : { data: [] },
    hasInvite
      ? supabase
          .from('my_buddies')
          .select()
          .order('created_at', { ascending: false })
      : { data: [] },
    hasInvite
      ? supabase.from('hangout_invites').select('user_id').eq('hangout_id', id)
      : { data: [] },
  ]);

  const invitableBuddies: MemberListItem[] = (
    (buddies ?? []) as Tables<'users'>[]
  )
    .filter((user) => !participants.some((member) => member.id === user.id))
    .map((user) => ({
      type: invites?.some(({ user_id }) => user_id === user.id)
        ? HangoutState.Invited
        : HangoutState.Initial,
      user,
    }));

  const photos = (signed ?? [])
    .filter((entry) => !entry.error && entry.signedUrl && entry.path)
    .map((entry) => ({ path: entry.path!, url: entry.signedUrl! }));

  return (
    <Hangout
      hangoutId={id}
      userId={userId}
      name={hangout.name}
      startedAt={hangout.started_at}
      endedAt={hangout.ended_at}
      state={state}
      members={participants}
      buddies={invitableBuddies}
      photos={photos}
      spots={spots ?? []}
      lastSpot={lastSpot}
      profile={profile}
      drinks={drinks ?? []}
      hangoutDrinks={hangoutDrinks ?? []}
      leaderboard={leaderboard ?? []}
      lastGame={lastGame}
      token={token}
    />
  );
}
