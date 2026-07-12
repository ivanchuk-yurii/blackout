export const authCallbackUrl =
  typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : '';
