'use client';

import { useState } from 'react';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
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
    }

    setPending(false);
  }

  return (
    <>
      <FieldError>{error}</FieldError>
      <Button type="button" size="lg" onClick={handleGoogle} disabled={pending}>
        <IconBrandGoogleFilled />
        {pending ? 'Redirecting…' : 'Continue with Google'}
      </Button>
    </>
  );
}
