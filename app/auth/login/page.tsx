'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { authCallbackUrl } from '../callback/url';

type Status = 'idle' | 'loading' | 'sent';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleMagicLink() {
    if (!email) {
      setError('Enter your email first.');
      return;
    }
    setStatus('loading');
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: authCallbackUrl,
      },
    });

    if (authError) {
      setError(authError.message);
      setStatus('idle');
      return;
    }
    setStatus('sent');
  }

  function handlePassword() {
    if (!email) {
      setError('Enter your email first.');
      return;
    }
    router.push(`/auth/password?email=${encodeURIComponent(email)}`);
  }

  if (status === 'sent') {
    return (
      <main>
        <p>Check your email for a login link.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <button
          type="button"
          onClick={handleMagicLink}
          disabled={status === 'loading'}
        >
          Continue with magic link
        </button>
        <button
          type="button"
          onClick={handlePassword}
          disabled={status === 'loading'}
        >
          Continue with password
        </button>
      </form>
    </main>
  );
}
