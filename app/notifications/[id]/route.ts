import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTemplate } from '@/lib/notifications/templates';

export async function GET(
  request: NextRequest,
  context: RouteContext<'/notifications/[id]'>,
) {
  const { id } = await context.params;
  const { origin } = new URL(request.url);
  const supabase = await createClient();

  const { data: notification } = await supabase
    .from('notifications')
    .select()
    .eq('id', id)
    .maybeSingle();

  if (!notification) return NextResponse.redirect(`${origin}/notifications`);

  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .is('read_at', null);

  const { url } = getTemplate(notification);

  return NextResponse.redirect(`${origin}${url}`);
}
