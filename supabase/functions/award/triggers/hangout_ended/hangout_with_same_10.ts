import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangouts'>,
  user_id: string,
): Promise<boolean> {
  const [{ data: hangouts }, { data: participants }] = await Promise.all([
    supabase
      .from('hangout_participant_ids')
      .select('hangout_id')
      .eq('user_id', user_id)
      .throwOnError(),
    supabase
      .from('hangout_participant_ids')
      .select('user_id')
      .eq('hangout_id', metadata.id)
      .neq('user_id', user_id)
      .throwOnError(),
  ]);

  if (!participants.length) return false;

  const { data: shared } = await supabase
    .from('hangout_participant_ids')
    .select('user_id')
    .in(
      'hangout_id',
      hangouts.map(({ hangout_id }) => hangout_id),
    )
    .in(
      'user_id',
      participants.map((participant) => participant.user_id),
    )
    .throwOnError();

  return participants.some(
    (participant) =>
      shared.filter((row) => row.user_id === participant.user_id).length >= 10,
  );
}
