import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  _supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangouts'>,
): Promise<boolean> {
  const weekday = new Intl.DateTimeFormat('en-GB', {
    timeZone: metadata.timezone,
    weekday: 'long',
  }).format(new Date(metadata.started_at));

  return weekday === 'Monday';
}
