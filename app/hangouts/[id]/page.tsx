import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@/lib/supabase/service';
import { Hangout } from './hangout';
import { Share } from './share';
import { End } from './end';
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
  const supabaseService = await createServiceClient();

  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;
  const userId = auth.claims.sub;

  const { data: hangout } = await supabase
    .from('hangouts')
    .select()
    .eq('id', id)
    .maybeSingle();

  if (!hangout) return null;

  const isCreator = hangout.creator_id === userId;

  const { data: creator } = await supabaseService.auth.admin.getUserById(
    hangout.creator_id,
  );

  const { data: members } = await supabase
    .from('hangout_members')
    .select()
    .eq('hangout_id', id);

  async function getState(): Promise<HangoutState> {
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

  const state = isCreator ? HangoutState.Initial : await getState();

  const buddies = isCreator
    ? ((await supabase.from('my_buddies').select()).data ?? [])
    : [];

  return (
    <main>
      <h1>{hangout.name}</h1>
      {hangout.ended_at && <p>Ended</p>}

      <section>
        <h2>Creator</h2>
        <p>{creator.user?.user_metadata.name}</p>
      </section>

      <Hangout
        hangoutId={id}
        userId={userId}
        isCreator={isCreator}
        initialState={state}
        buddies={buddies}
        members={members ?? []}
        token={token}
      />

      {isCreator && !hangout.ended_at && <Share hangoutId={id} />}
      {isCreator && !hangout.ended_at && <End hangoutId={id} />}
    </main>
  );
}
