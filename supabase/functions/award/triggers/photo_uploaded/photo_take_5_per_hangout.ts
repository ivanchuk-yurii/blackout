import type { SupabaseContext } from '@supabase/server';
import type { Database } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: { hangout_id: string; owner_id: string },
): Promise<boolean> {
  const { count } = await supabase
    .from('hangout_photos')
    .select('*', { count: 'exact', head: true })
    .eq('hangout_id', metadata.hangout_id)
    .eq('user_id', metadata.owner_id)
    .throwOnError();

  return (count ?? 0) >= 5;
}
