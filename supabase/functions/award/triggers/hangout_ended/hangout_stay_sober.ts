import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangouts'>,
  user_id: string,
): Promise<boolean> {
  const { count } = await supabase
    .from('hangout_drinks')
    .select('*', { count: 'exact', head: true })
    .eq('hangout_id', metadata.id)
    .eq('user_id', user_id)
    .throwOnError();

  return count === 0;
}
