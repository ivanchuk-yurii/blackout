import type { SupabaseContext } from '@supabase/server';
import type { Database, Tables } from '@/lib/supabase/types';

export default async function check(
  supabase: SupabaseContext<Database>['supabaseAdmin'],
  metadata: Tables<'hangouts'>,
): Promise<boolean> {
  const [{ data: participants }, { data: photos }] = await Promise.all([
    supabase
      .from('hangout_participant_ids')
      .select('user_id')
      .eq('hangout_id', metadata.id)
      .throwOnError(),
    supabase
      .from('hangout_photos')
      .select('user_id')
      .eq('hangout_id', metadata.id)
      .throwOnError(),
  ]);

  if (participants.length < 2) return false;

  return participants.every((participant) =>
    photos.some((photo) => photo.user_id === participant.user_id),
  );
}
