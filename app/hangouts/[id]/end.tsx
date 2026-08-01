'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function End({ hangoutId }: { hangoutId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleEnd() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangouts')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', hangoutId);
    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    router.refresh();
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={handleEnd} disabled={pending}>
        {pending ? 'Ending…' : 'End hangout'}
      </button>
    </>
  );
}
