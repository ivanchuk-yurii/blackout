import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  _metadata: Tables<'hangouts'>,
  user_id: string,
): Promise<string[]> {
  const { count } = await supabase
    .from('hangout_participant_ids')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id)
    .throwOnError();

  const total = count ?? 0;
  const achievements: string[] = [];

  if (total >= 100) achievements.push('hangout_participate_100');
  if (total >= 50) achievements.push('hangout_participate_50');
  if (total >= 25) achievements.push('hangout_participate_25');
  if (total >= 10) achievements.push('hangout_participate_10');
  if (total >= 1) achievements.push('hangout_participate_1');

  return achievements;
}
