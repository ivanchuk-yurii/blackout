import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  _metadata: Tables<'spots'>,
  user_id: string,
): Promise<string[]> {
  const { count } = await supabase
    .from('user_spot_ids')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id)
    .throwOnError();

  const total = count ?? 0;
  const achievements: string[] = [];

  if (total >= 50) achievements.push('spot_attend_50');
  if (total >= 25) achievements.push('spot_attend_25');
  if (total >= 10) achievements.push('spot_attend_10');
  if (total >= 5) achievements.push('spot_attend_5');
  if (total >= 1) achievements.push('spot_attend_1');

  return achievements;
}
