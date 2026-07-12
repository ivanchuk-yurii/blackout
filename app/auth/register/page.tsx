'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { authCallbackUrl } from '../callback/url';

type Status = 'idle' | 'loading' | 'sent';

export default function RegisterPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      .value;

    const supabase = createClient();
    const emailRedirectTo = authCallbackUrl;

    const { error: authError } = password
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo },
        })
      : await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true, emailRedirectTo },
        });

    if (authError) {
      setError(authError.message);
      setStatus('idle');
      return;
    }

    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <main>
        <p>Check your email to confirm your account.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password">Password (optional)</label>
          <input id="password" name="password" type="password" />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Registering…' : 'Register'}
        </button>
      </form>
    </main>
  );
}
