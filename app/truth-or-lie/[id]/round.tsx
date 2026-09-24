'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { type Tables } from '@/lib/supabase/types';
import { cn } from '@/lib/utils/tailwind';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';

export function Round({
  gameId,
  userId,
  question,
  isAuthor,
  authorName,
  correctAnswer,
  myAnswer: initialMyAnswer,
  answered: initialAnswered,
  voters,
}: {
  gameId: string;
  userId: string;
  question: Tables<'truth_or_lie_questions'>;
  isAuthor: boolean;
  authorName: string;
  correctAnswer: boolean | null;
  myAnswer: boolean | null;
  answered: number;
  voters: number;
}) {
  const router = useRouter();
  const [myAnswer, setMyAnswer] = useState(initialMyAnswer);
  const [answered, setAnswered] = useState(initialAnswered);
  const [reveal, setReveal] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`truth_or_lie_round:${question.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'truth_or_lie_answers',
          filter: `question_id=eq.${question.id}`,
        },
        () => setAnswered((current) => current + 1),
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'truth_or_lie_questions',
          filter: `game_id=eq.${gameId}`,
        },
        async () => {
          const { data } = await supabase
            .from('truth_or_lie_correct_answers')
            .select('answer')
            .eq('id', question.id)
            .maybeSingle();

          if (data) setReveal(data.answer);
        },
      );

    void supabase.realtime.setAuth().then(() => channel.subscribe());

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [gameId, question.id]);

  async function handleVote(answer: boolean) {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('truth_or_lie_answers').insert({
      question_id: question.id,
      user_id: userId,
      answer,
    });

    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMyAnswer(answer);
  }

  const prompt = (className?: string) => (
    <p
      className={cn(
        'mt-4 rounded-2xl border border-border px-4 py-6 text-center font-heading text-2xl font-medium text-balance',
        className,
      )}
    >
      {question.question}
    </p>
  );

  const waiting = (
    <p className="mt-6 text-center text-sm text-muted-foreground">
      {answered} of {voters} {voters === 1 ? 'guess' : 'guesses'} in
    </p>
  );

  if (reveal !== null) {
    const guessedRight = myAnswer === reveal;

    return (
      <div className="flex flex-1 flex-col">
        <h1 className="mt-4 font-heading text-xl font-medium">
          {reveal
            ? `${isAuthor ? 'Your' : `${authorName}'s`} story was true`
            : `${isAuthor ? 'Your' : `${authorName}'s`} story was made up`}
        </h1>

        {prompt(
          reveal
            ? 'border-success/30 bg-success/10'
            : 'border-destructive/30 bg-destructive/10',
        )}

        {!isAuthor && (
          <p className="mt-6 text-center text-sm font-medium">
            You guessed {guessedRight ? 'right' : 'wrong'}
          </p>
        )}

        <div className="mt-6">
          <Button size="lg" className="w-full" onClick={() => router.refresh()}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (isAuthor) {
    return (
      <div className="flex flex-1 flex-col">
        <h1 className="mt-4 font-heading text-xl font-medium">
          {correctAnswer
            ? 'Tell a true story about:'
            : 'Invent a story so others believe:'}
        </h1>

        {prompt(
          correctAnswer
            ? 'border-success/30 bg-success/10'
            : 'border-destructive/30 bg-destructive/10',
        )}
        {waiting}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mt-4 font-heading text-xl font-medium">
        Is {authorName} telling the truth or lie?
      </h1>

      {prompt()}

      {myAnswer === null ? (
        <>
          <FieldError>{error}</FieldError>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              size="lg"
              disabled={pending}
              onClick={() => handleVote(true)}
            >
              Truth
            </Button>
            <Button
              size="lg"
              variant="destructive"
              disabled={pending}
              onClick={() => handleVote(false)}
            >
              Lie
            </Button>
          </div>
        </>
      ) : (
        <p className="mt-6 text-center text-sm">
          You guessed{' '}
          <span className="font-medium">{myAnswer ? 'truth' : 'lie'}</span>
        </p>
      )}

      {waiting}
    </div>
  );
}
