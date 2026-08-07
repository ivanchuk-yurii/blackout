'use client';

import { useEffect, useState } from 'react';
import { initOneSignal, OneSignal } from '@/lib/notifications/onesignal';

export function PushNotifications() {
  const [ready, setReady] = useState(false);
  const [optedIn, setOptedIn] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;

    function sync() {
      if (!active) return;

      setOptedIn(OneSignal.User.PushSubscription.optedIn ?? false);
      setBlocked(OneSignal.Notifications.permissionNative === 'denied');
    }

    initOneSignal()
      .then(() => {
        if (!active || !OneSignal.Notifications.isPushSupported()) return;

        sync();
        setReady(true);

        OneSignal.User.PushSubscription.addEventListener('change', sync);
        OneSignal.Notifications.addEventListener('permissionChange', sync);
      })
      .catch(() => {});

    return () => {
      active = false;

      OneSignal.User.PushSubscription.removeEventListener('change', sync);
      OneSignal.Notifications.removeEventListener('permissionChange', sync);
    };
  }, []);

  async function handleSubscribe() {
    setPending(true);

    await OneSignal.User.PushSubscription.optIn();

    setPending(false);
  }

  async function handleUnsubscribe() {
    setPending(true);

    await OneSignal.User.PushSubscription.optOut();

    setPending(false);
  }

  if (!ready) return null;

  if (blocked) {
    return <p role="alert">Notifications are blocked for this site.</p>;
  }

  return optedIn ? (
    <button type="button" onClick={handleUnsubscribe} disabled={pending}>
      {pending ? 'Turning off…' : 'Turn off notifications'}
    </button>
  ) : (
    <button type="button" onClick={handleSubscribe} disabled={pending}>
      {pending ? 'Turning on…' : 'Turn on notifications'}
    </button>
  );
}
