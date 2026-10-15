import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangout_drinks'>,
): Promise<boolean> {
  const { count } = await supabase
    .from('hangout_drinks')
    .select('*', { count: 'exact', head: true })
    .eq('hangout_id', metadata.hangout_id)
    .eq('user_id', metadata.user_id)
    .throwOnError();

  return (count ?? 0) >= 5;
}
