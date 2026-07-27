'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BuddyState } from '@/app/buddies/[id]/state';

export function Buddy({
  userId,
  buddyId,
  initialState,
  token,
}: {
  userId: string;
  buddyId: string;
  initialState: BuddyState;
  token?: string;
}) {
  const [state, setState] = useState<BuddyState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleAdd() {
    setPending(true);
    setError(null);

    const supabase = createClient();

    if (token) {
      const { error } = await supabase
        .from('buddies')
        .insert({
          user_id: userId,
          buddy_id: buddyId,
        })
        .setHeader('x-share-token', token);

      if (!error) {
        setPending(false);
        setState(BuddyState.Buddies);
        return;
      }
    }

    const { error } = await supabase.from('buddy_requests').insert({
      user_id: userId,
      buddy_id: buddyId,
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setState(BuddyState.Requested);
  }

  async function handleCancel() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('buddy_requests')
      .delete()
      .eq('buddy_id', buddyId);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setState(BuddyState.Initial);
  }

  async function handleAccept() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('buddies').insert({
      user_id: buddyId,
      buddy_id: userId,
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setState(BuddyState.Buddies);
  }

  async function handleRemove() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('buddies')
      .delete()
      .or(`buddy_id.eq.${buddyId},user_id.eq.${buddyId}`);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setState(BuddyState.Initial);
  }

  return (
    <div>
      {error && <p role="alert">{error}</p>}
      {state === BuddyState.Initial && (
        <button onClick={handleAdd} disabled={pending}>
          Add
        </button>
      )}
      {state === BuddyState.Requested && (
        <button onClick={handleCancel} disabled={pending}>
          Cancel
        </button>
      )}
      {state === BuddyState.Invited && (
        <button onClick={handleAccept} disabled={pending}>
          Accept
        </button>
      )}
      {state === BuddyState.Buddies && (
        <button onClick={handleRemove} disabled={pending}>
          Remove
        </button>
      )}
    </div>
  );
}
