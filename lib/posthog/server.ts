import {
  PostHog,
  cookieStateToProperties,
  cookieStoreFromHeader,
  readPostHogCookie,
} from 'posthog-node';

type CookieStore = Parameters<typeof readPostHogCookie>[0];

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!;

export const posthog = new PostHog(token, { host: 'https://eu.i.posthog.com' });

export function readIdentity(
  source: CookieStore | string | string[] | undefined,
) {
  const header = Array.isArray(source) ? source.join('; ') : source;
  const store =
    typeof header === 'string' ? cookieStoreFromHeader(header) : header;
  const state = store ? readPostHogCookie(store, token) : null;

  return {
    distinctId: state?.distinctId,
    properties: cookieStateToProperties(state),
  };
}
