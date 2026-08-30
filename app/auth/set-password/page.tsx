'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import { PageHeader } from '@/components/common/page-header';
import { PasswordInput } from '@/components/common/password-input';

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError(authError.message);
      setPending(false);
      return;
    }

    router.push('/home');
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader />
      <form onSubmit={handleSubmit} className="mt-28 flex flex-col gap-6 px-4">
        <h1 className="text-2xl font-medium">Change your password</h1>
        <div className="flex flex-col gap-4">
          <PasswordInput
            autoComplete="new-password"
            placeholder="New password"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            At least 6 characters.
          </p>
          <FieldError>{error}</FieldError>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={password.length < 6 || pending}
        >
          {pending ? 'Saving…' : 'Save password'}
        </Button>
      </form>
    </main>
  );
}
