import { type Tables } from '@/lib/supabase/types';

const MEDALS = ['🥇', '🥈', '🥉'];

const WHOLE = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
const DECIMAL = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });

export function Leaderboard({
  places,
}: {
  places: Tables<'hangout_leaderboard'>[];
}) {
  return (
    <ol className="my-2 divide-y divide-border rounded-2xl border border-border px-3">
      {places.map((place, index) => (
        <li key={place.id ?? index} className="flex items-center gap-3 py-2">
          <span
            aria-label={`Place ${index + 1}`}
            className="w-6 shrink-0 text-center text-lg/none tabular-nums"
          >
            {MEDALS[index] ?? index + 1}
          </span>

          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {place.name ?? 'Someone'}
          </span>

          <div className="shrink-0 text-right">
            <p className="font-heading text-lg font-medium tabular-nums">
              {DECIMAL.format(place.units ?? 0)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                units
              </span>
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {place.count} {place.count === 1 ? 'drink' : 'drinks'} ·{' '}
              {WHOLE.format(place.volume ?? 0)} ml
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
