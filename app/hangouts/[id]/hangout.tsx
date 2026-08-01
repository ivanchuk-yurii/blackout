'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HangoutState } from '@/app/hangouts/[id]/state';

export function Hangout({
  hangoutId,
  userId,
  isCreator,
  initialState,
  buddies,
  members: initialMembers,
  token,
}: {
  hangoutId: string;
  userId: string;
  isCreator: boolean;
  initialState: HangoutState;
  buddies: { id: string }[];
  members: { user_id: string }[];
  token?: string;
}) {
  const [state, setState] = useState<HangoutState>(initialState);
  const [members, setMembers] = useState(initialMembers);
  const [buddyId, setBuddyId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleInvite() {
    if (!buddyId) return;

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('hangout_invites').insert({
      hangout_id: hangoutId,
      user_id: buddyId,
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setBuddyId('');
  }

  async function handleRequest() {
    setPending(true);
    setError(null);

    const supabase = createClient();

    if (token) {
      const { error } = await supabase
        .from('hangout_members')
        .insert({
          hangout_id: hangoutId,
          user_id: userId,
        })
        .setHeader('x-share-token', token);

      if (!error) {
        setPending(false);
        setState(HangoutState.Member);
        setMembers((current) => [...current, { user_id: userId }]);
        return;
      }
    }

    const { error } = await supabase.from('hangout_requests').insert({
      hangout_id: hangoutId,
      user_id: userId,
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setState(HangoutState.Requested);
  }

  async function handleCancel() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangout_requests')
      .delete()
      .eq('hangout_id', hangoutId)
      .eq('user_id', userId);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setState(HangoutState.Initial);
  }

  async function handleAccept() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('hangout_members').insert({
      hangout_id: hangoutId,
      user_id: userId,
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setState(HangoutState.Member);
    setMembers((current) => [...current, { user_id: userId }]);
  }

  async function handleDecline() {
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
    setState(HangoutState.Initial);
  }

  async function handleLeave() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangout_members')
      .delete()
      .eq('hangout_id', hangoutId)
      .eq('user_id', userId);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setState(HangoutState.Initial);
    setMembers((current) => current.filter((m) => m.user_id !== userId));
  }

  async function handleRemove(memberId: string) {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangout_members')
      .delete()
      .eq('hangout_id', hangoutId)
      .eq('user_id', memberId);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMembers((current) => current.filter((m) => m.user_id !== memberId));
  }

  return (
    <div>
      {error && <p role="alert">{error}</p>}

      {isCreator && (
        <div>
          <select
            value={buddyId}
            onChange={(event) => setBuddyId(event.target.value)}
          >
            <option value="" disabled>
              Select a buddy…
            </option>
            {buddies.map((buddy) => (
              <option key={buddy.id} value={buddy.id}>
                {buddy.id}
              </option>
            ))}
          </select>
          <button onClick={handleInvite} disabled={pending || !buddyId}>
            Invite
          </button>
        </div>
      )}

      {!isCreator && state === HangoutState.Initial && (
        <button onClick={handleRequest} disabled={pending}>
          Join
        </button>
      )}
      {!isCreator && state === HangoutState.Requested && (
        <button onClick={handleCancel} disabled={pending}>
          Cancel
        </button>
      )}
      {!isCreator && state === HangoutState.Invited && (
        <>
          <button onClick={handleAccept} disabled={pending}>
            Accept
          </button>
          <button onClick={handleDecline} disabled={pending}>
            Decline
          </button>
        </>
      )}
      {!isCreator && state === HangoutState.Member && (
        <button onClick={handleLeave} disabled={pending}>
          Leave
        </button>
      )}

      <section>
        <h2>Members</h2>
        {members.map((member) => (
          <div key={member.user_id}>
            <p>{member.user_id}</p>
            {isCreator && (
              <button
                onClick={() => handleRemove(member.user_id)}
                disabled={pending}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
