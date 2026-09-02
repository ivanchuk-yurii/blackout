import { Enums, Tables } from '@/lib/supabase/types';

export type FullHangoutDrink = Tables<'hangout_drinks'> & {
  drink: Tables<'drinks'>;
};

export type DrinkMetrics = Pick<Tables<'drinks'>, 'abv'> &
  Pick<Tables<'hangout_drinks'>, 'volume' | 'created_at'>;

export const DRINK_CATEGORY_EMOJIS: Record<
  Enums<'drink_categories'>,
  string
> = {
  beer: '🍺',
  cider: '🧃',
  wine: '🍷',
  cocktail: '🍹',
  spirit: '🥃',
};
