import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangouts'>,
  user_id: string,
): Promise<boolean> {
  if (user_id !== metadata.creator_id) return false;

  const { count } = await supabase
    .from('hangouts')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', user_id)
    .throwOnError();

  return (count ?? 0) >= 5;
}
