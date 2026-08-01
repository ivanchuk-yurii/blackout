'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function CreateForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = (
      new FormData(event.currentTarget).get('name') as string
    )?.trim();
    if (!name) {
      setError('Name is required.');
      return;
    }

    setPending(true);
    setError(null);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('hangouts')
      .insert({ name, creator_id: userId, timezone })
      .select()
      .single();
    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    router.push(`/hangouts/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" required />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Creating…' : 'Create'}
      </button>
    </form>
  );
}
