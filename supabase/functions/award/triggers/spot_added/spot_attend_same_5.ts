import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'spots'>,
  user_id: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('unique_spot_ids')
    .select('count')
    .eq('user_id', user_id)
    .eq('google_maps_id', metadata.google_maps_id)
    .maybeSingle()
    .throwOnError();

  return (data?.count ?? 0) >= 5;
}
