import { createClient } from '@/lib/supabase/client';
import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: 'https://eu.i.posthog.com',
  defaults: '2026-05-30',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === 'development',
});

let identifiedUserId: string | null = null;

createClient().auth.onAuthStateChange((_event, session) => {
  const user = session?.user;

  if (!user) {
    if (identifiedUserId) {
      posthog.reset();
      identifiedUserId = null;
    }
    return;
  }

  if (user.id === identifiedUserId) return;

  identifiedUserId = user.id;
  posthog.identify(user.id);
});
