import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangout_drinks'>,
): Promise<string[]> {
  const { count } = await supabase
    .from('hangout_drinks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', metadata.user_id)
    .throwOnError();

  const total = count ?? 0;
  const achievements: string[] = [];

  if (total >= 100) achievements.push('drink_consume_100');
  if (total >= 50) achievements.push('drink_consume_50');
  if (total >= 25) achievements.push('drink_consume_25');
  if (total >= 10) achievements.push('drink_consume_10');
  if (total >= 1) achievements.push('drink_consume_1');

  return achievements;
}
