'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { HangoutState } from './state';

type Result = { error: { message: string } | null };

type Running =
  'end' | 'restart' | 'join' | 'cancel' | 'accept' | 'decline' | 'leave';

export function Action({
  hangoutId,
  userId,
  userState,
  isActive,
  token,
}: {
  hangoutId: string;
  userId: string;
  userState: HangoutState;
  isActive: boolean;
  token?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Running | null>(null);

  async function run(
    running: Running,
    action: () => PromiseLike<Result>,
    quiet = false,
  ) {
    setPending(running);

    const { error } = await action();
    setPending(null);
    if (error) {
      if (!quiet) toast.add({ type: 'error', title: error.message });
      return false;
    }

    router.refresh();
    return true;
  }

  async function handleJoin() {
    const supabase = createClient();

    const joined =
      token != null &&
      (await run(
        'join',
        () =>
          supabase
            .from('hangout_members')
            .insert({ hangout_id: hangoutId, user_id: userId })
            .setHeader('x-share-token', token),
        true,
      ));
    if (joined) return;

    await run('join', () =>
      supabase
        .from('hangout_requests')
        .insert({ hangout_id: hangoutId, user_id: userId }),
    );
  }

  function handleCancel() {
    const supabase = createClient();
    return run('cancel', () =>
      supabase
        .from('hangout_requests')
        .delete()
        .eq('hangout_id', hangoutId)
        .eq('user_id', userId),
    );
  }

  function handleAccept() {
    const supabase = createClient();
    return run('accept', () =>
      supabase
        .from('hangout_members')
        .insert({ hangout_id: hangoutId, user_id: userId }),
    );
  }

  function handleDecline() {
    const supabase = createClient();
    return run('decline', () =>
      supabase
        .from('hangout_invites')
        .delete()
        .eq('hangout_id', hangoutId)
        .eq('user_id', userId),
    );
  }

  function handleLeave() {
    const supabase = createClient();
    return run('leave', () =>
      supabase
        .from('hangout_members')
        .delete()
        .eq('hangout_id', hangoutId)
        .eq('user_id', userId),
    );
  }

  function handleRestart() {
    const supabase = createClient();
    return run('restart', () =>
      supabase.from('hangouts').update({ ended_at: null }).eq('id', hangoutId),
    );
  }

  function handleEnd() {
    const supabase = createClient();
    return run('end', () =>
      supabase
        .from('hangouts')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', hangoutId),
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-auto py-3">
      {userState === HangoutState.Creator &&
        (isActive ? (
          <Button
            type="button"
            size="lg"
            variant="destructive"
            onClick={handleEnd}
            disabled={pending !== null}
            className="w-full"
          >
            {pending === 'end' ? 'Ending…' : 'End hangout'}
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={handleRestart}
            disabled={pending !== null}
            className="w-full"
          >
            {pending === 'restart' ? 'Restarting…' : 'Restart'}
          </Button>
        ))}

      {isActive && userState === HangoutState.Initial && (
        <Button
          type="button"
          size="lg"
          onClick={handleJoin}
          disabled={pending !== null}
          className="w-full"
        >
          {pending === 'join' ? 'Joining…' : 'Join'}
        </Button>
      )}

      {isActive && userState === HangoutState.Requested && (
        <Button
          type="button"
          size="lg"
          variant="secondary"
          onClick={handleCancel}
          disabled={pending !== null}
          className="w-full"
        >
          {pending === 'cancel' ? 'Cancelling…' : 'Cancel'}
        </Button>
      )}

      {isActive && userState === HangoutState.Invited && (
        <div className="flex gap-2">
          <Button
            type="button"
            size="lg"
            onClick={handleAccept}
            disabled={pending !== null}
            className="flex-1"
          >
            {pending === 'accept' ? 'Accepting…' : 'Accept'}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            onClick={handleDecline}
            disabled={pending !== null}
            className="flex-1"
          >
            {pending === 'decline' ? 'Declining…' : 'Decline'}
          </Button>
        </div>
      )}

      {isActive && userState === HangoutState.Member && (
        <Button
          type="button"
          size="lg"
          variant="destructive"
          onClick={handleLeave}
          disabled={pending !== null}
          className="w-full"
        >
          {pending === 'leave' ? 'Leaving…' : 'Leave'}
        </Button>
      )}
    </div>
  );
}
