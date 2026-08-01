import { createClient } from '@/lib/supabase/server';
import { CreateForm } from './create-form';

export default async function CreateHangoutPage() {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;

  return (
    <main>
      <h1>Create hangout</h1>
      <CreateForm userId={auth.claims.sub} />
    </main>
  );
}
