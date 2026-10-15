import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'spots'>,
): Promise<boolean> {
  const { count } = await supabase
    .from('spots')
    .select('*', { count: 'exact', head: true })
    .eq('hangout_id', metadata.hangout_id)
    .throwOnError();

  return (count ?? 0) >= 3;
}
