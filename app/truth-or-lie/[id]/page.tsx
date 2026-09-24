import { createClient } from '@/lib/supabase/server';
import { type Tables } from '@/lib/supabase/types';
import { TruthOrLie } from './truth-or-lie';
import { type Score } from './results';

export default async function TruthOrLiePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;
  const userId = auth.claims.sub;

  const [{ data: game }, { data: members }] = await Promise.all([
    supabase
      .from('truth_or_lie')
      .select('*, hangout:hangouts!inner(creator_id)')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('truth_or_lie_members')
      .select('user:users!inner(*)')
      .eq('game_id', id)
      .order('created_at'),
  ]);

  if (!game) return null;

  const players = (members ?? []).map((member) => member.user);
  const isOrganiser = game.hangout.creator_id === userId;

  const { data: question } =
    game.state === 'started'
      ? await supabase
          .from('truth_or_lie_questions')
          .select()
          .eq('game_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null };

  const isAuthor = question?.user_id === userId;
  const author = players.find((player) => player.id === question?.user_id);

  const [{ data: correct }, { data: answer }, { data: answers }] =
    await Promise.all([
      question && isAuthor
        ? supabase
            .from('truth_or_lie_correct_answers')
            .select('answer')
            .eq('id', question.id)
            .maybeSingle()
        : { data: null },
      question && !isAuthor
        ? supabase
            .from('truth_or_lie_answers')
            .select('answer')
            .eq('question_id', question.id)
            .eq('user_id', userId)
            .maybeSingle()
        : { data: null },
      question
        ? supabase
            .from('truth_or_lie_answers')
            .select('user_id')
            .eq('question_id', question.id)
        : { data: [] },
    ]);

  const scores = game.state === 'finished' ? await getScores() : [];

  async function getScores(): Promise<Score[]> {
    const { data: questions } = await supabase
      .from('truth_or_lie_questions')
      .select('id, user_id')
      .eq('game_id', id);

    const ids = (questions ?? []).map((question) => question.id);
    if (!ids.length) return [];

    const [{ data: allAnswers }, { data: corrects }] = await Promise.all([
      supabase
        .from('truth_or_lie_answers')
        .select('question_id, user_id, answer')
        .in('question_id', ids),
      supabase
        .from('truth_or_lie_correct_answers')
        .select('id, answer')
        .in('id', ids),
    ]);

    const authors = new Map((questions ?? []).map((q) => [q.id, q.user_id]));
    const truths = new Map((corrects ?? []).map((c) => [c.id, c.answer]));
    const points = new Map<string, number>();

    for (const vote of allAnswers ?? []) {
      const truth = truths.get(vote.question_id);
      if (truth === undefined) continue;

      const winner =
        vote.answer === truth ? vote.user_id : authors.get(vote.question_id);
      if (!winner) continue;

      points.set(winner, (points.get(winner) ?? 0) + 1);
    }

    return players
      .map((player: Tables<'users'>) => ({
        user: player,
        points: points.get(player.id) ?? 0,
      }))
      .sort((a, b) => b.points - a.points);
  }

  return (
    <TruthOrLie
      gameId={id}
      userId={userId}
      state={game.state}
      isOrganiser={isOrganiser}
      players={players}
      question={question}
      isAuthor={isAuthor}
      authorName={author?.name ?? 'Someone'}
      correctAnswer={correct?.answer ?? null}
      myAnswer={answer?.answer ?? null}
      answered={(answers ?? []).length}
      scores={scores}
    />
  );
}
