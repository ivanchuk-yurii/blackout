const PUB = '🍺';
const BAR = '🍸';
const CLUB = '🪩';
const RESTAURANT = '🍽️';
const PARK = '🌳';
const DEFAULT = '🏠';

export function placeEmoji(types: string[] | undefined) {
  if (!types?.length) return DEFAULT;
  if (types.includes('night_club')) return CLUB;
  if (types.includes('pub')) return PUB;
  if (types.includes('bar')) return BAR;
  if (types.includes('restaurant')) return RESTAURANT;
  if (types.includes('park')) return PARK;
  return DEFAULT;
}
