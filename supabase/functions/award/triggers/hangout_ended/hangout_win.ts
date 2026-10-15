import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangouts'>,
  user_id: string,
): Promise<boolean> {
  const { data: winner } = await supabase
    .from('hangout_leaderboard')
    .select('id')
    .eq('hangout_id', metadata.id)
    .order('units', { ascending: false })
    .limit(1)
    .maybeSingle()
    .throwOnError();

  return winner?.id === user_id;
}
