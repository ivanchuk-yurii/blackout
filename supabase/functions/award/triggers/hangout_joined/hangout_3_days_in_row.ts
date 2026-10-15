import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

const DAY = 24 * 60 * 60 * 1000;

function localDay(date: string | number, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone }).format(new Date(date));
}

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangouts'>,
  user_id: string,
): Promise<boolean> {
  const { data: hangouts } = await supabase
    .from('hangout_participant_ids')
    .select('hangout_id')
    .eq('user_id', user_id)
    .throwOnError();

  const startedAt = Date.parse(metadata.started_at);

  const { data: recent } = await supabase
    .from('hangouts')
    .select('started_at, timezone')
    .in(
      'id',
      hangouts.map(({ hangout_id }) => hangout_id as string),
    )
    .gte('started_at', new Date(startedAt - 3 * DAY).toISOString())
    .throwOnError();

  const days = recent.map(({ started_at, timezone }) =>
    localDay(started_at, timezone),
  );

  return [0, 1, 2].every((offset) =>
    days.includes(localDay(startedAt - offset * DAY, metadata.timezone)),
  );
}
