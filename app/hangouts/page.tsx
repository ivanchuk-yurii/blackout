import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function HangoutsPage() {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;

  const { data: hangouts } = await supabase.from('hangouts_feed').select();

  return (
    <main>
      <h1>Hangouts</h1>

      <Link href="/hangouts/create">Create hangout</Link>

      {hangouts?.map((hangout) => (
        <div key={hangout.id}>
          <Link href={`/hangouts/${hangout.id}`}>{hangout.name}</Link>
        </div>
      ))}
    </main>
  );
}
