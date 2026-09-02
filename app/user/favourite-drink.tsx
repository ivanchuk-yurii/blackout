import { type Enums } from '@/lib/supabase/types';
import { DRINK_CATEGORY_EMOJIS } from '@/lib/supabase/custom-types';

export function FavouriteDrink({
  name,
  category,
  count,
}: {
  name: string;
  category: Enums<'drink_categories'>;
  count: number;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 rounded-full border border-[#a3a3a3] bg-[linear-gradient(90deg,#ffffff_0%,#ababab_44.712%,#f7f7f7_69.712%,#999999_100%)] py-2 pr-6 pl-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center text-[32px] leading-none"
          >
            {DRINK_CATEGORY_EMOJIS[category]}
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
    </div>
  );
}
