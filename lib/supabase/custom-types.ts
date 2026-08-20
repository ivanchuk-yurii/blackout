import { Tables } from '@/lib/supabase/types';

export type FullHangoutDrink = Tables<'hangout_drinks'> & {
  drink: Tables<'drinks'>;
};
