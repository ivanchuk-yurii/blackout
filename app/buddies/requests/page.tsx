import { createClient } from '@/lib/supabase/server';

export default async function BuddyRequestsPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) return null;

  const { data: incoming } = await supabase
    .from('buddy_requests')
    .select()
    .eq('buddy_id', data.claims.sub);
  const { data: outgoing } = await supabase
    .from('buddy_requests')
    .select()
    .eq('user_id', data.claims.sub);

  return (
    <main>
      <h1>Buddies requests</h1>

      <h2>Incoming</h2>
      {incoming?.map((item) => (
        <div key={item.user_id}>
          <p>{item.user_id}</p>
        </div>
      ))}

      <h2>Outgoing</h2>

      {outgoing?.map((item) => (
        <div key={item.buddy_id}>
          <p>{item.buddy_id}</p>
        </div>
      ))}
    </main>
  );
}
