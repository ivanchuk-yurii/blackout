import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@/lib/supabase/service';
import { Hangout } from './hangout';
import { Drinks } from './drinks';
import { Spots } from './spots';
import { Camera } from './camera';
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

  const { data: drinks } = await supabase
    .from('drinks')
    .select()
    .order('category')
    .order('name');

  const { data: hangoutDrinks } = await supabase
    .from('hangout_drinks')
    .select()
    .eq('hangout_id', id)
    .eq('user_id', userId);

  const { data: spots } = await supabase
    .from('spots')
    .select()
    .eq('hangout_id', id)
    .order('created_at');

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
  const isParticipant = isCreator || state === HangoutState.Member;

  const buddies = isCreator
    ? ((await supabase.from('my_buddies').select()).data ?? [])
    : [];

  let photos: { path: string; url: string }[] = [];
  if (isParticipant) {
    const { data: files } = await supabase.storage
      .from('hangout-photos')
      .list(id);
    const paths = (files ?? [])
      .filter((file) => file.id !== null)
      .map((file) => `${id}/${file.name}`);
    if (paths.length) {
      const { data: signed } = await supabase.storage
        .from('hangout-photos')
        .createSignedUrls(paths, 60 * 60);
      photos = (signed ?? [])
        .filter((entry) => !entry.error && entry.signedUrl && entry.path)
        .map((entry) => ({ path: entry.path!, url: entry.signedUrl! }));
    }
  }

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
        buddies={buddies as { id: string }[]}
        members={members ?? []}
        token={token}
      />

      <Drinks
        hangoutId={id}
        userId={userId}
        canAdd={isParticipant && !hangout.ended_at}
        drinks={drinks ?? []}
        hangoutDrinks={hangoutDrinks ?? []}
      />

      <Spots
        hangoutId={id}
        canAdd={isParticipant && !hangout.ended_at}
        spots={spots ?? []}
      />

      <Camera
        hangoutId={id}
        canAdd={isParticipant && !hangout.ended_at}
        initialPhotos={photos}
      />

      {isCreator && !hangout.ended_at && <Share hangoutId={id} />}
      {isCreator && !hangout.ended_at && <End hangoutId={id} />}
    </main>
  );
}
