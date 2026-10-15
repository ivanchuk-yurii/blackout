import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  _supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangouts'>,
): Promise<boolean> {
  if (metadata.ended_by !== 'user' || !metadata.ended_at) return false;

  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: metadata.timezone,
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(new Date(metadata.ended_at)),
  );

  return hour >= 3 && hour < 7;
}
