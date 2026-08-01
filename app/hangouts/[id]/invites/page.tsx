import { createClient } from '@/lib/supabase/server';
import { Invite } from './invite';

export default async function HangoutInvitesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) return null;

  const { data: invites } = await supabase
    .from('hangout_invites')
    .select()
    .eq('hangout_id', id);

  return (
    <main>
      <h1>Hangout invites</h1>

      {invites?.map((item) => (
        <Invite key={item.user_id} hangoutId={id} userId={item.user_id} />
      ))}
    </main>
  );
}
