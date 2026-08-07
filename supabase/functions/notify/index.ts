import { withSupabase } from '@supabase/server';
import { getTemplate } from '../../../lib/notifications/templates.ts';

export default {
  fetch: withSupabase({ auth: 'secret' }, async (request) => {
    const row = await request.json();
    const { title, body, tag } = getTemplate(row);

    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${Deno.env.get('ONESIGNAL_API_KEY')}`,
      },
      body: JSON.stringify({
        app_id: Deno.env.get('ONESIGNAL_APP_ID'),
        target_channel: 'push',
        include_aliases: { external_id: [row.user_id] },
        idempotency_key: row.id,
        headings: { en: title },
        contents: { en: body },
        url: `/notifications/${row.id}`,
        web_push_topic: tag,
      }),
    });

    const result = await response.text();

    if (!response.ok) {
      console.error(`onesignal ${response.status} for ${row.id}: ${result}`);

      return new Response(result, { status: 502 });
    }

    return Response.json({ sent: row.id });
  }),
};
