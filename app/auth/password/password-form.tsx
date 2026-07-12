'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { authCallbackUrl } from '../callback/url';

export function PasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get(
      'password',
    ) as string;

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    router.push('/home');
    router.refresh();
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Go back and enter your email first.');
      return;
    }

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${authCallbackUrl}?password`,
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }

    setResetSent(true);
  }

  if (resetSent) {
    return <p>Check your email for a link to reset your password.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Logging in…' : 'Log in'}
      </button>
      <button type="button" onClick={handleForgotPassword} disabled={pending}>
        Forgot password?
      </button>
    </form>
  );
}
