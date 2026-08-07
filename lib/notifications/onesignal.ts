import OneSignal from 'react-onesignal';

let initialization: Promise<void> | null = null;

export function initOneSignal() {
  initialization ??= OneSignal.init({
    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
    allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
    notificationClickHandlerMatch: 'origin',
    notificationClickHandlerAction: 'navigate',
  });

  return initialization;
}

export { OneSignal };
