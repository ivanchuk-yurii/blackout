import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  context: RouteContext<'/hangouts/[id]/join'>,
) {
  const { id } = await context.params;
  const { origin, searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  const target = new URL(`/hangouts/${id}`, origin);

  if (!token) return NextResponse.redirect(target);

  target.searchParams.set('token', token);

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) return NextResponse.redirect(target);

  await supabase
    .from('hangout_members')
    .insert({ hangout_id: id, user_id: data.claims.sub })
    .setHeader('x-share-token', token);

  return NextResponse.redirect(target);
}
