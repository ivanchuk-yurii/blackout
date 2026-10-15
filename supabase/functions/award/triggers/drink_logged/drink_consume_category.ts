import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangout_drinks'>,
): Promise<string[]> {
  const { data } = await supabase
    .from('unique_drink_ids')
    .select('count, drinks(category)')
    .eq('user_id', metadata.user_id)
    .throwOnError();

  const categories = data.reduce<Record<string, number>>(
    (acc, { count, drinks }) => {
      if (drinks) acc[drinks.category] = (acc[drinks.category] ?? 0) + count;

      return acc;
    },
    {},
  );
  const achievements: string[] = [];

  for (const category in categories) {
    if (categories[category] >= 25) {
      achievements.push(`drink_consume_${category}_25`);
    }
  }

  return achievements;
}
