'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import { PageHeader } from '@/components/common/page-header';
import { authCallbackUrl } from '../callback/url';

export type SentType = 'register' | 'password';

const PURPOSE: Record<SentType, string> = {
  register: 'to confirm registration',
  password: 'to reset password',
};

export function SentView({ email, type }: { email: string; type: SentType }) {
  const [pending, setPending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } =
      type === 'register'
        ? await supabase.auth.resend({
            type: 'signup',
            email,
            options: { emailRedirectTo: authCallbackUrl },
          })
        : await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${authCallbackUrl}?password`,
          });
    setPending(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setResent(true);
  }

  return (
    <main className="flex flex-1 flex-col pb-6">
      <PageHeader />
      <div className="mt-28 flex flex-col gap-6 px-4">
        <p className="text-2xl font-medium text-foreground/50">
          Open link we’ve sent to{' '}
          <span className="text-foreground">{email}</span> {PURPOSE[type]}
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            {resent ? 'Link sent again.' : 'Didn’t receive the email?'}
          </p>
          <Button
            type="button"
            variant="link"
            className="h-auto w-fit p-0 font-normal text-foreground underline"
            onClick={handleResend}
            disabled={pending}
          >
            {pending ? 'Sending…' : 'Send again'}
          </Button>
          <FieldError>{error}</FieldError>
        </div>
      </div>
    </main>
  );
}
