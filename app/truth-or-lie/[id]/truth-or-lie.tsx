'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { type Enums, type Tables } from '@/lib/supabase/types';
import { PageHeader } from '@/components/common/page-header';
import { Lobby } from './lobby';
import { Round } from './round';
import { Results, type Score } from './results';

export function TruthOrLie({
  gameId,
  userId,
  state,
  isOrganiser,
  players,
  question,
  isAuthor,
  authorName,
  correctAnswer,
  myAnswer,
  answered,
  scores,
}: {
  gameId: string;
  userId: string;
  state: Enums<'truth_or_lie_states'>;
  isOrganiser: boolean;
  players: Tables<'users'>[];
  question: Tables<'truth_or_lie_questions'> | null;
  isAuthor: boolean;
  authorName: string;
  correctAnswer: boolean | null;
  myAnswer: boolean | null;
  answered: number;
  scores: Score[];
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase.channel(`truth_or_lie:${gameId}`).on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'truth_or_lie',
        filter: `id=eq.${gameId}`,
      },
      () => router.refresh(),
    );

    void supabase.realtime.setAuth().then(() => channel.subscribe());

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [gameId, router]);

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Truth or Lie" />

      <div className="flex flex-1 flex-col px-3 pb-6">
        {state === 'pending' && (
          <Lobby
            gameId={gameId}
            userId={userId}
            players={players}
            isOrganiser={isOrganiser}
          />
        )}

        {state === 'started' && question && (
          <Round
            key={question.id}
            gameId={gameId}
            userId={userId}
            question={question}
            isAuthor={isAuthor}
            authorName={authorName}
            correctAnswer={correctAnswer}
            myAnswer={myAnswer}
            answered={answered}
            voters={Math.max(players.length - 1, 0)}
          />
        )}

        {state === 'finished' && <Results scores={scores} />}
      </div>
    </main>
  );
}
