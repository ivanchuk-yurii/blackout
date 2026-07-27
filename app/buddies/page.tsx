import { createClient } from '@/lib/supabase/server';

export default async function BuddiesPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) return null;

  const { data: buddies } = await supabase.rpc('my_buddies');

  return (
    <main>
      <h1>Buddies</h1>

      {buddies?.map((buddy) => (
        <div key={buddy.id}>
          <p>{buddy.id}</p>
        </div>
      ))}
    </main>
  );
}
