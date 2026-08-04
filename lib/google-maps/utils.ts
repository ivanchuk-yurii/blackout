import { GOOGLE_MAPS_BASE_URL } from './const';

export function photoUrl(name: string) {
  return `${GOOGLE_MAPS_BASE_URL}/${name}/media?maxWidthPx=400&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}`;
}

export function formatDistance(meters: number) {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}
