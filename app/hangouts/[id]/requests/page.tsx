import { createClient } from '@/lib/supabase/server';
import { Request } from './request';

export default async function HangoutRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) return null;

  const { data: requests } = await supabase
    .from('hangout_requests')
    .select()
    .eq('hangout_id', id);

  return (
    <main>
      <h1>Hangout requests</h1>

      {requests?.map((item) => (
        <Request key={item.user_id} hangoutId={id} userId={item.user_id} />
      ))}
    </main>
  );
}
