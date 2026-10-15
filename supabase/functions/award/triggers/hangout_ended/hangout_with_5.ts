import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangouts'>,
): Promise<boolean> {
  const { count } = await supabase
    .from('hangout_participant_ids')
    .select('*', { count: 'exact', head: true })
    .eq('hangout_id', metadata.id)
    .throwOnError();

  return (count ?? 0) >= 5;
}
