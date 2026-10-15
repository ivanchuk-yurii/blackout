import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  _supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangouts'>,
): Promise<boolean> {
  const startedAt = new Date(metadata.started_at);

  const day = new Intl.DateTimeFormat('en-GB', {
    timeZone: metadata.timezone,
    month: '2-digit',
    day: '2-digit',
  }).format(startedAt);

  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: metadata.timezone,
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(startedAt),
  );

  return (day === '31/12' && hour >= 7) || (day === '01/01' && hour < 3);
}
