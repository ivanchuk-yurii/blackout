import { type Enums } from '@/lib/supabase/types';
import { DRINK_CATEGORY_EMOJIS } from '@/lib/supabase/custom-types';

const PLACEHOLDER_EMOJIS = [
  '🥂',
  '🍺',
  '🍻',
  '🍸',
  '🍹',
  '🥃',
  '🍾',
  '🍷',
  '🔍',
  '🤔',
  '🧐',
  '🎲',
];

export function FavouriteDrink({
  name,
  category,
  count,
}: {
  name?: string;
  category?: Enums<'drink_categories'>;
  count?: number;
}) {
  if (!name || !category || !count) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 rounded-full border-3 border-dashed border-border py-4 pr-6 pl-4 text-muted-foreground">
        <span
          aria-hidden
          className="relative flex size-10 shrink-0 items-center justify-center"
        >
          {PLACEHOLDER_EMOJIS.map((emoji, index) => (
            <span
              key={emoji}
              className="absolute animate-emoji-cycle text-lg/7 opacity-0 motion-reduce:animate-none motion-reduce:first:opacity-100"
              style={{ animationDelay: `${index * 3}s` }}
            >
              {emoji}
            </span>
          ))}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-lg/7 font-medium">
            And your favourite drink is...
          </p>
          <p className="text-xs/4">
            Log your drinks to discover your top choice!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-4 rounded-full border border-[#a3a3a3] bg-[linear-gradient(90deg,#ffffff_0%,#ababab_44.712%,#f7f7f7_69.712%,#999999_100%)] py-2 pr-6 pl-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center text-[32px] leading-none"
        >
          {category && DRINK_CATEGORY_EMOJIS[category]}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-xs/4 text-accent">All time favourite</p>
          <p className="truncate text-lg/7 font-medium text-secondary">
            {name}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center text-center">
        <p className="text-xs/4 text-accent">had it</p>
        <p className="bg-linear-to-b from-[#7d7d7d] to-[#1a1a1a] bg-clip-text text-2xl/8 font-medium tabular-nums text-transparent">
          {count ?? 0}
        </p>
        <p className="text-xs/4 text-accent">times</p>
      </div>
    </div>
  );
}
