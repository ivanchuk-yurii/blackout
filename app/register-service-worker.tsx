'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { initOneSignal, OneSignal } from '@/lib/notifications/onesignal';

async function handleOneSignal(id?: string) {
  try {
    await initOneSignal();

    if (id) {
      await OneSignal.login(id);
    } else {
      await OneSignal.logout();
    }
  } catch {}
}

export function RegisterServiceWorker() {
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => void handleOneSignal(session?.user.id),
    );

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
