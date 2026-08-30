'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/page-header';

export default function SetNamePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({
      data: { name: name.trim() },
    });
    if (authError) {
      setError(authError.message);
      setPending(false);
      return;
    }

    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      setError(refreshError.message);
      setPending(false);
      return;
    }

    router.push('/user/edit-profile?initial');
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader />
      <form onSubmit={handleSubmit} className="mt-28 flex flex-col gap-6 px-4">
        <h1 className="text-2xl font-medium">What&apos;s your name?</h1>
        <div className="flex flex-col gap-4">
          <Input
            name="name"
            type="text"
            autoComplete="name"
            aria-label="Name"
            placeholder="Your name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FieldError>{error}</FieldError>
        </div>
        <Button type="submit" size="lg" disabled={!name.trim() || pending}>
          {pending ? 'Saving…' : 'Continue'}
        </Button>
      </form>
    </main>
  );
}
