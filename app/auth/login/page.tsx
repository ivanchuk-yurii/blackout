'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import { EmailInput } from '@/components/common/email-input';
import { PageHeader } from '@/components/common/page-header';
import { PasswordInput } from '@/components/common/password-input';
import { authCallbackUrl } from '../callback/url';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setPending(false);
      return;
    }

    router.push('/home');
    router.refresh();
  }

  async function handleResetPassword() {
    if (!email) {
      setError('Enter your email first.');
      return;
    }

    setPasswordPending(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${authCallbackUrl}?password` },
    );

    if (authError) {
      setError(authError.message);
      setPasswordPending(false);
      return;
    }

    router.push(`/auth/sent?type=password&email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader />
      <form onSubmit={handleSubmit} className="mt-28 flex flex-col gap-6 px-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium">Welcome back!</h1>
          <p className="text-sm text-muted-foreground">
            Sign into your account to get back at it
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <EmailInput
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FieldError>{error}</FieldError>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={!email || !password || pending}
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
          <Button
            type="button"
            variant="link"
            className="mx-auto h-auto p-0 font-normal text-muted-foreground underline"
            onClick={handleResetPassword}
            disabled={passwordPending}
          >
            {passwordPending ? 'Sending…' : 'Reset password'}
          </Button>
        </div>
      </form>
    </main>
  );
}
