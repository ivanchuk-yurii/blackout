'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function Invite({
  hangoutId,
  userId,
}: {
  hangoutId: string;
  userId: string;
}) {
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCancel() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangout_invites')
      .delete()
      .eq('hangout_id', hangoutId)
      .eq('user_id', userId);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setHidden(true);
  }

  if (hidden) return null;

  return (
    <div>
      <p>{userId}</p>
      {error && <p role="alert">{error}</p>}
      <button onClick={handleCancel} disabled={pending}>
        Cancel
      </button>
    </div>
  );
}
