import { withSupabase } from '@supabase/server';
import { type Database } from '@/lib/supabase/types';

export default {
  fetch: withSupabase<Database>(
    { auth: 'secret' },
    async (request, { supabaseAdmin }) => {
      const { trigger, user_id, metadata } = await request.json();

      const { data: achievements, error } = await supabaseAdmin
        .from('achievements')
        .select('*, user_achievements(user_id)')
        .eq('trigger', trigger)
        .eq('user_achievements.user_id', user_id)
        .is('user_achievements', null);

      if (error) {
        return new Response(error.message, { status: 500 });
      }

      const names = [
        ...new Set(achievements.map(({ key, group }) => group ?? key)),
      ];

      const results = await Promise.all(
        names.map(async (name) => {
          try {
            const check: (
              supabase: typeof supabaseAdmin,
              metadata: unknown,
              user_id: string,
            ) => Promise<boolean | string[]> = (
              await import(`./triggers/${trigger}/${name}.ts`)
            ).default;

            const achievement = await check(supabaseAdmin, metadata, user_id);
            const keys = Array.isArray(achievement)
              ? achievement
              : achievement
                ? [name]
                : [];

            if (!keys.length) return [];

            await supabaseAdmin
              .from('user_achievements')
              .upsert(
                keys.map((key) => ({ key, user_id })),
                { onConflict: 'key,user_id', ignoreDuplicates: true },
              )
              .throwOnError();

            return keys;
          } catch (error) {
            console.error(`award: ${trigger}/${name} failed`, error);

            return [];
          }
        }),
      );

      return Response.json({ earned: results.flat() });
    },
  ),
};
