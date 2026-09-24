'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { type Tables } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import { UserListItem } from '@/components/common/user-list-item';

export function Lobby({
  gameId,
  userId,
  players: initialPlayers,
  isOrganiser,
}: {
  gameId: string;
  userId: string;
  players: Tables<'users'>[];
  isOrganiser: boolean;
}) {
  const router = useRouter();
  const [players, setPlayers] = useState(initialPlayers);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMember = players.some((player) => player.id === userId);
  const canLeave = isMember && !isOrganiser;

  const addPlayer = useCallback(async (playerId: string) => {
    const supabase = createClient();
    const { data: user } = await supabase
      .from('users')
      .select()
      .eq('id', playerId)
      .maybeSingle();

    if (!user) return;

    setPlayers((current) =>
      current.some((player) => player.id === user.id)
        ? current
        : [...current, user],
    );
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`truth_or_lie_members:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'truth_or_lie_members',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const member = payload.new as Tables<'truth_or_lie_members'>;
          void addPlayer(member.user_id);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'truth_or_lie_members',
        },
        (payload) => {
          const member = payload.old as Tables<'truth_or_lie_members'>;
          if (member.game_id !== gameId) return;

          setPlayers((current) =>
            current.filter((player) => player.id !== member.user_id),
          );
        },
      );

    void supabase.realtime.setAuth().then(() => channel.subscribe());

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [gameId, addPlayer]);

  async function handleJoin() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('truth_or_lie_members')
      .insert({ game_id: gameId, user_id: userId });

    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    void addPlayer(userId);
  }

  async function handleLeave() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('truth_or_lie_members')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId);

    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPlayers((current) => current.filter((player) => player.id !== userId));
  }

  async function handleStart() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('truth_or_lie')
      .update({ state: 'started' })
      .eq('id', gameId);

    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <h1 className="mt-4 font-heading text-xl font-medium">
          Waiting to start
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {!isMember
            ? 'Join to play this round of Truth or Lie.'
            : isOrganiser
              ? 'Start the game once everyone has joined.'
              : 'The organiser will start the game shortly.'}
        </p>

        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border px-3">
          {players.map((player) => (
            <li key={player.id}>
              <UserListItem {...player} />
            </li>
          ))}
        </ul>

        {!players.length && (
          <p className="mt-4 text-sm text-muted-foreground">
            Nobody has joined yet.
          </p>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <FieldError>{error}</FieldError>

        {!isMember && (
          <Button
            size="lg"
            className="w-full"
            disabled={pending}
            onClick={handleJoin}
          >
            Join game
          </Button>
        )}

        {isOrganiser && (
          <Button
            size="lg"
            variant={isMember ? 'default' : 'outline'}
            className="w-full"
            disabled={pending || players.length < 2}
            onClick={handleStart}
          >
            Start game
          </Button>
        )}

        {canLeave && (
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={handleLeave}
          >
            Leave game
          </Button>
        )}
      </div>

      {isOrganiser && players.length < 2 && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          At least two players are needed to start.
        </p>
      )}
    </>
  );
}
