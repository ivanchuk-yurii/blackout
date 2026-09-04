import { Enums, Tables } from '@/lib/supabase/types';

export type FullHangoutDrink = Tables<'hangout_drinks'> & {
  drink: Tables<'drinks'>;
};

export type DrinkMetrics = Pick<Tables<'drinks'>, 'abv'> &
  Pick<Tables<'hangout_drinks'>, 'volume' | 'created_at'>;

export type LeaderboardDrink = Pick<Tables<'drinks'>, 'id' | 'abv'> &
  Pick<Tables<'hangout_drinks'>, 'volume'>;

export type HangoutLeaderboardEntry = Omit<
  Tables<'hangout_leaderboard'>,
  'drinks'
> & {
  drinks: LeaderboardDrink[];
};

export interface Photo {
  path: string;
  url: string;
}

export interface Point {
  lat: number;
  lon: number;
}

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
