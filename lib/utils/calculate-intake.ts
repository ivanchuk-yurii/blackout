import { Tables, Enums } from '@/lib/supabase/types';
import { FullHangoutDrink } from '@/lib/supabase/custom-types';

type DrinkTypeConfig =
  | {
      pace: number;
    }
  | {
      duration: number;
    };

interface DrinkingWindow {
  start: number;
  end: number;
  grams: number;
}

export interface IntakePoint {
  time: number;
  rate: number;
}

const DRINK_CONFIG: Record<Enums<'drink_categories'>, DrinkTypeConfig> = {
  beer: { pace: 33 },
  cider: { pace: 33 },
  wine: { pace: 8.75 },
  cocktail: { duration: 15 },
  spirit: { duration: 5 },
};

const STEP_MIN = 5;
export const SOFT_MAX = 0.025;
export const MILD_MAX = 0.125;

function calculateAge(birthDate: string) {
  const date = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return age;
}

function calculateTBW(profile: Tables<'user_profiles'>): number {
  const { gender, birth_date, weight, height } = profile;

  switch (gender) {
    case 'male':
      const age = calculateAge(birth_date);
      return 2.447 - 0.09516 * age + 0.1074 * height + 0.3362 * weight;
    case 'female':
      return -2.097 + 0.1069 * height + 0.2466 * weight;
  }
}

function calculateGrams(volume: number, abv: number): number {
  return volume * (abv / 100) * 0.789;
}

function buildDrinkingWindows(
  hangoutDrinks: FullHangoutDrink[],
): DrinkingWindow[] {
  return hangoutDrinks.map((hangoutDrink, i) => {
    const config = DRINK_CONFIG[hangoutDrink.drink.category];
    const averageDuration =
      'duration' in config
        ? config.duration * 60_000
        : 'pace' in config
          ? (hangoutDrink.volume / config.pace) * 60_000
          : 0;
    const nextHangoutDrink = hangoutDrinks[i + 1];
    const start = new Date(hangoutDrink.created_at).getTime();

    const duration = nextHangoutDrink
      ? Math.min(
          new Date(nextHangoutDrink.created_at).getTime() - start,
          averageDuration,
        )
      : averageDuration;

    return {
      start,
      end: start + duration,
      grams: calculateGrams(hangoutDrink.volume, hangoutDrink.drink.abv),
    };
  });
}

function gramsBetween(
  window: DrinkingWindow,
  from: number,
  to: number,
): number {
  if (window.end <= window.start) {
    return window.start >= from && window.start < to ? window.grams : 0;
  }

  const overlapStart = Math.max(from, window.start);
  const overlapEnd = Math.min(to, window.end);
  if (overlapEnd <= overlapStart) return 0;

  return (
    window.grams * ((overlapEnd - overlapStart) / (window.end - window.start))
  );
}

export function simulateIntake(
  profile: Tables<'user_profiles'> | null,
  drinks: FullHangoutDrink[],
): IntakePoint[] {
  if (drinks.length === 0) return [];

  const tbw = profile ? calculateTBW(profile) : 40;
  const windows = buildDrinkingWindows(drinks);

  const stepMs = STEP_MIN * 60_000;
  // TODO account hangout end
  const start = Math.min(...windows.map((window) => window.start));
  const end = Math.max(...windows.map((window) => window.end), Date.now());

  const points: IntakePoint[] = [];
  let t = start;

  points.push({ time: t - stepMs, rate: 0 });

  for (; t <= end; t += stepMs) {
    const grams = windows.reduce(
      (sum, window) => sum + gramsBetween(window, t, t + stepMs),
      0,
    );
    const rate = grams / (STEP_MIN * tbw);

    points.push({ time: t, rate });
  }

  points.push({ time: t, rate: 0 });

  return points;
}
