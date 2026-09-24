'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconChevronRight } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { type Enums, type Tables } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

const ROUNDS = 5;

const STATES: Record<Enums<'truth_or_lie_states'>, string> = {
  pending: 'Waiting to start',
  started: 'In progress',
  finished: 'Finished',
};

export type LastGame = Pick<Tables<'truth_or_lie'>, 'id' | 'state' | 'rounds'>;

export function TruthOrLie({
  hangoutId,
  userId,
  isCreator,
  isActive,
  game,
}: {
  hangoutId: string;
  userId: string;
  isCreator: boolean;
  isActive: boolean;
  game: LastGame | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const canCreate =
    isCreator && isActive && (!game || game.state === 'finished');

  async function handleCreate() {
    setPending(true);

    const supabase = createClient();

    const { data: created, error: createError } = await supabase
      .from('truth_or_lie')
      .insert({ hangout_id: hangoutId, rounds: ROUNDS })
      .select('id')
      .single();

    if (createError) {
      setPending(false);
      toast.add({
        type: 'error',
        title: createError.message,
      });
      return;
    }

    const { error: joinError } = await supabase
      .from('truth_or_lie_members')
      .insert({ game_id: created.id, user_id: userId });

    setPending(false);
    if (joinError) {
      toast.add({ type: 'error', title: joinError.message });
      return;
    }

    router.push(`/truth-or-lie/${created.id}`);
  }

  if (!game && !canCreate) return null;

  return (
    <section className="my-2">
      {game && (
        <Link
          href={`/truth-or-lie/${game.id}`}
          className="flex items-center gap-3 rounded-2xl border border-border px-3 py-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span aria-hidden className="text-xl/none">
            🎭
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Truth or Lie</p>
            <p className="text-xs text-muted-foreground">
              {STATES[game.state]} · {game.rounds}{' '}
              {game.rounds === 1 ? 'round' : 'rounds'}
            </p>
          </div>

          <IconChevronRight className="size-4 text-muted-foreground" />
        </Link>
      )}

      {canCreate && (
        <Button
          variant="outline"
          size="lg"
          className="mt-2 w-full"
          disabled={pending}
          onClick={handleCreate}
        >
          {game ? 'New Truth or Lie game' : 'Start Truth or Lie'}
        </Button>
      )}
    </section>
  );
}
