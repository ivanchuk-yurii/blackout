import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangout_drinks'>,
): Promise<string[]> {
  const { count } = await supabase
    .from('unique_drink_ids')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', metadata.user_id)
    .throwOnError();

  const total = count ?? 0;
  const achievements: string[] = [];

  if (total >= 67) achievements.push('drink_consume_unique_67');
  if (total >= 50) achievements.push('drink_consume_unique_50');
  if (total >= 25) achievements.push('drink_consume_unique_25');
  if (total >= 10) achievements.push('drink_consume_unique_10');
  if (total >= 5) achievements.push('drink_consume_unique_5');

  return achievements;
}
