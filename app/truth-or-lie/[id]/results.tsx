import { type Tables } from '@/lib/supabase/types';

const MEDALS = ['🥇', '🥈', '🥉'];

export interface Score {
  user: Tables<'users'>;
  points: number;
}

export function Results({ scores }: { scores: Score[] }) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mt-4 font-heading text-xl font-medium">Final scores</h1>

      <ol className="my-2 divide-y divide-border rounded-2xl border border-border px-3">
        {scores.map((score, index) => (
          <li key={score.user.id} className="flex items-center gap-3 py-2">
            <span
              aria-label={`Place ${index + 1}`}
              className="w-6 shrink-0 text-center text-lg/none tabular-nums"
            >
              {MEDALS[index] ?? index + 1}
            </span>

            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {score.user.name ?? 'Someone'}
            </span>

            <p className="shrink-0 font-heading text-lg font-medium tabular-nums">
              {score.points}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {score.points === 1 ? 'point' : 'points'}
              </span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
