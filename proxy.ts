import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_ROUTES = [
  '/home',
  '/user',
  '/notifications',
  '/buddies',
  '/hangouts',
];

const PROTECTED_AUTH_ROUTES = [
  '/auth/compliance',
  '/auth/set-name',
  '/auth/set-password',
];

export async function proxy(request: NextRequest) {
  const isProtected = PROTECTED_ROUTES.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(route + '/'),
  );
  const isAuthProtected = PROTECTED_AUTH_ROUTES.some(
    (route) => request.nextUrl.pathname === route,
  );
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();

  let redirectTo = '';

  if (isProtected) {
    if (!data?.claims) {
      redirectTo = '/auth';
    } else if (!data.claims.user_metadata?.compliance_accepted_at) {
      redirectTo = '/auth/compliance';
    } else if (!data.claims.user_metadata?.name) {
      redirectTo = '/auth/set-name';
    }
  } else if (isAuthProtected) {
    if (!data?.claims) redirectTo = '/auth';
  } else if (request.nextUrl.pathname === '/auth') {
    if (data?.claims) redirectTo = '/home';
  }

  if (!redirectTo && request.nextUrl.pathname === '/home') {
    const next = request.cookies.get('next')?.value;
    if (next) {
      const dest = new URL(next, request.nextUrl.origin);
      if (dest.origin === request.nextUrl.origin) {
        dest.searchParams.set('from-auth', '');
        const redirect = NextResponse.redirect(dest);
        redirect.cookies.delete('next');
        return redirect;
      }
    }
  }

  if (!redirectTo || request.nextUrl.pathname === redirectTo) return response;

  const url = request.nextUrl.clone();
  url.pathname = redirectTo;
  url.search = '';

  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));

  if (isProtected && request.nextUrl.pathname !== '/home') {
    redirect.cookies.set(
      'next',
      request.nextUrl.pathname + request.nextUrl.search,
      {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 600,
      },
    );
  }

  return redirect;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
