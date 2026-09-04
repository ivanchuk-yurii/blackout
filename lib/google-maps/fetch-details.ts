import { GOOGLE_MAPS_PLACES_URL } from './const';
import { type Place } from './types';

export async function fetchDetails(
  placeId: string,
  sessionToken?: string | null,
): Promise<Place | null> {
  const url = new URL(`${GOOGLE_MAPS_PLACES_URL}/places/${placeId}`);
  if (sessionToken) url.searchParams.set('sessionToken', sessionToken);

  const response = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      'X-Goog-FieldMask': 'id,displayName,location,photos',
    },
  });
  if (!response.ok) throw new Error('Could not load place details');
  return response.json();
}
