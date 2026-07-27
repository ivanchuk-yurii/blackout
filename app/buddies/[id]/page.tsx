import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@/lib/supabase/service';
import { Buddy } from './buddy';
import { BuddyState } from './state';

export default async function BuddyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id: buddyId } = await params;
  const { token } = await searchParams;

  const supabase = await createClient();
  const supabaseService = await createServiceClient();

  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;
  const userId = auth.claims.sub;

  const { data } = await supabaseService.auth.admin.getUserById(buddyId);
  if (!data.user) return null;

  async function getState(): Promise<BuddyState> {
    const { data: approval } = await supabase
      .from('buddy_requests')
      .select()
      .eq('user_id', buddyId)
      .throwOnError()
      .maybeSingle();

    if (approval) return BuddyState.Invited;

    const { data: requested } = await supabase
      .from('buddy_requests')
      .select()
      .eq('buddy_id', buddyId)
      .throwOnError()
      .maybeSingle();

    if (requested) return BuddyState.Requested;

    const { data: buddies } = await supabase
      .from('buddies')
      .select()
      .or(
        `and(user_id.eq.${userId},buddy_id.eq.${buddyId}),and(user_id.eq.${buddyId},buddy_id.eq.${userId})`,
      )
      .throwOnError()
      .maybeSingle();

    if (buddies) return BuddyState.Buddies;

    return BuddyState.Initial;
  }
  const state = await getState();

  return (
    <main>
      <h1>{data.user.user_metadata.name}</h1>
      <Buddy
        userId={userId}
        buddyId={buddyId}
        initialState={state}
        token={token}
      />
    </main>
  );
}
