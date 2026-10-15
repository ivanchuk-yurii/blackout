import type { SupabaseContext } from '@supabase/server';
import type { Database } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: { hangout_id: string; created_at: string },
): Promise<boolean> {
  const { data: hangout } = await supabase
    .from('hangouts')
    .select('timezone')
    .eq('id', metadata.hangout_id)
    .single()
    .throwOnError();

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: hangout.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(metadata.created_at));

  return time === '00:12';
}
