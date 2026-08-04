import { GOOGLE_MAPS_BASE_URL, SEARCH_RADIUS } from './const';
import { type AutocompletePlacesResponse, type LatLng } from './types';

export async function autocomplete(
  input: string,
  { sessionToken, origin }: { sessionToken: string; origin?: LatLng | null },
): Promise<AutocompletePlacesResponse> {
  const response = await fetch(`${GOOGLE_MAPS_BASE_URL}/places:autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    },
    body: JSON.stringify({
      input,
      sessionToken,
      ...(origin
        ? {
            origin,
            locationBias: {
              circle: { center: origin, radius: SEARCH_RADIUS },
            },
          }
        : {}),
    }),
  });
  if (!response.ok) throw new Error('Autocomplete request failed');
  return response.json();
}
