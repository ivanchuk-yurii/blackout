import { type DrinkMetrics } from '@/lib/supabase/custom-types';

export interface DrinkWeek {
  start: number;
  end: number;
  count: number;
  units: number;
}

export const SAFE_MAX_UNITS = 14;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function calculateUnits(volume: number, abv: number): number {
  return (volume * abv) / 1000;
}

export function startOfWeek(date: Date | number | string): number {
  const start = new Date(date);

  // TODO adapt to timezone
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));

  return start.getTime();
}

export function startOfRange(
  weeks: number,
  now: Date | number = Date.now(),
): number {
  return startOfWeek(now) - (weeks - 1) * WEEK_MS;
}

export function buildDrinkWeeks(
  drinks: DrinkMetrics[],
  weeks: number,
  now: Date | number = Date.now(),
): DrinkWeek[] {
  const current = startOfWeek(now);
  const buckets = Array.from({ length: weeks }, (_, i) => ({
    start: current - (weeks - 1 - i) * WEEK_MS,
    end: current - (weeks - 2 - i) * WEEK_MS,
    count: 0,
    units: 0,
  }));

  for (const drink of drinks) {
    const index =
      weeks - 1 - (current - startOfWeek(drink.created_at)) / WEEK_MS;
    const bucket = buckets[index];

    if (!bucket) continue;

    bucket.count++;
    bucket.units += calculateUnits(drink.volume, drink.abv);
  }

  return buckets;
}

export function calculateSafeMaxShare(units: number): number {
  return Math.round((units / SAFE_MAX_UNITS) * 100);
}
