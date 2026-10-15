import type { SupabaseContext } from '@supabase/server';
import type { Database } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: { owner_id: string },
): Promise<string[]> {
  const { count } = await supabase
    .from('hangout_photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', metadata.owner_id)
    .throwOnError();

  const total = count ?? 0;
  const achievements: string[] = [];

  if (total >= 100) achievements.push('photo_take_100');
  if (total >= 50) achievements.push('photo_take_50');
  if (total >= 25) achievements.push('photo_take_25');
  if (total >= 10) achievements.push('photo_take_10');
  if (total >= 1) achievements.push('photo_take_1');

  return achievements;
}
