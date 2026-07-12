'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { authCallbackUrl } from './callback/url';

export function GoogleButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: authCallbackUrl,
      },
    });

    if (authError) {
      setError(authError.message);
      setPending(false);
    }
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={handleGoogle} disabled={pending}>
        {pending ? 'Redirecting…' : 'Continue with Google'}
      </button>
    </>
  );
}
