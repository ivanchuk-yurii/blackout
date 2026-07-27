import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './profile-form';

export default async function SetProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('gender, birth_date, weight, height')
    .eq('id', data.claims.sub)
    .maybeSingle();

  return (
    <main>
      <h1>Your profile</h1>
      <ProfileForm userId={data.claims.sub} initialProfile={profile} />
    </main>
  );
}
