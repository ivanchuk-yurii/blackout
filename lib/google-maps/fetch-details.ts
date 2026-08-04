import { GOOGLE_MAPS_BASE_URL } from './const';
import { type Place } from './types';

export async function fetchDetails(
  placeId: string,
  sessionToken?: string | null,
): Promise<Place | null> {
  const url = new URL(`${GOOGLE_MAPS_BASE_URL}/places/${placeId}`);
  if (sessionToken) url.searchParams.set('sessionToken', sessionToken);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        'X-Goog-FieldMask': 'id,displayName,location,photos',
      },
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;
  return response.json();
}
