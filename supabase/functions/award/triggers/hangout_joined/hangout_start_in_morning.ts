import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  _supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangouts'>,
): Promise<boolean> {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: metadata.timezone,
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(new Date(metadata.started_at)),
  );

  return hour >= 7 && hour < 12;
}
