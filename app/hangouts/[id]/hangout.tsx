'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HangoutState } from '@/app/hangouts/[id]/state';

const SOS_INTERVAL = 5_000;

export function Hangout({
  hangoutId,
  userId,
  isCreator,
  initialState,
  inSos: initialInSos,
  buddies,
  members: initialMembers,
  token,
}: {
  hangoutId: string;
  userId: string;
  isCreator: boolean;
  initialState: HangoutState;
  inSos: boolean;
  buddies: { id: string }[];
  members: { user_id: string }[];
  token?: string;
}) {
  const [state, setState] = useState<HangoutState>(initialState);
  const [members, setMembers] = useState(initialMembers);
  const [buddyId, setBuddyId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [inSos, setInSos] = useState(initialInSos);

  const watchRef = useRef<number | null>(null);
  const updatedAtRef = useRef(0);

  useEffect(() => {
    if (!inSos) return;

    watchRef.current = navigator.geolocation?.watchPosition(
      (position) => {
        if (position.timestamp - updatedAtRef.current < SOS_INTERVAL) return;

        const supabase = createClient();
        void supabase
          .from('sos_alerts')
          .update({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            updated_at: new Date(position.timestamp).toISOString(),
          })
          .eq('hangout_id', hangoutId)
          .eq('user_id', userId)
          .then();
      },
      null,
      { enableHighAccuracy: true },
    );

    return () => {
      if (watchRef.current === null) return;
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    };
  }, [hangoutId, userId, inSos]);

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

  async function handleSos() {
    setPending(true);
    setError(null);

    const position: GeolocationPosition | null = await new Promise(
      (resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(position);
          },
          () => {
            resolve(null);
          },
          { enableHighAccuracy: true },
        );
      },
    );
    const timestamp = position?.timestamp ?? Date.now();

    const supabase = createClient();
    const { error } = await supabase.from('sos_alerts').insert({
      hangout_id: hangoutId,
      user_id: userId,
      lat: position?.coords.latitude ?? null,
      lon: position?.coords.longitude ?? null,
      updated_at: new Date(timestamp).toISOString(),
    });

    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    updatedAtRef.current = timestamp;
    setInSos(true);
  }

  async function handleCancelSos() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('sos_alerts')
      .delete()
      .eq('hangout_id', hangoutId)
      .eq('user_id', userId);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    updatedAtRef.current = 0;
    setInSos(false);
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

      {(isCreator || state === HangoutState.Member) &&
        (inSos ? (
          <button onClick={handleCancelSos} disabled={pending}>
            Cancel SOS
          </button>
        ) : (
          <button onClick={handleSos} disabled={pending}>
            SOS
          </button>
        ))}

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
