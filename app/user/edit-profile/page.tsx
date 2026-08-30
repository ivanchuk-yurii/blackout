import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/common/page-header';
import { ProfileForm } from './profile-form';

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ initial?: string | string[] }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) return null;

  const { initial } = await searchParams;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select()
    .eq('id', data.claims.sub)
    .maybeSingle();

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Body stats" />
      <ProfileForm
        userId={data.claims.sub}
        initialProfile={profile}
        initial={initial !== undefined}
      />
    </main>
  );
}
