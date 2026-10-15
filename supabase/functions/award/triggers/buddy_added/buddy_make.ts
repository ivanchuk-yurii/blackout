import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  _metadata: Tables<'buddies'>,
  user_id: string,
): Promise<string[]> {
  const { count } = await supabase
    .from('buddies')
    .select('*', { count: 'exact', head: true })
    .or(`user_id.eq.${user_id},buddy_id.eq.${user_id}`)
    .throwOnError();

  const total = count ?? 0;
  const achievements: string[] = [];

  if (total >= 50) achievements.push('buddy_make_50');
  if (total >= 25) achievements.push('buddy_make_25');
  if (total >= 10) achievements.push('buddy_make_10');
  if (total >= 5) achievements.push('buddy_make_5');
  if (total >= 1) achievements.push('buddy_make_1');

  return achievements;
}
