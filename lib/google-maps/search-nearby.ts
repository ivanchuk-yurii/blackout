import { GOOGLE_MAPS_PLACES_URL, NEARBY_TYPES, SEARCH_RADIUS } from './const';
import { type SearchNearbyResponse } from './types';

export async function searchNearby(
  latitude: number,
  longitude: number,
): Promise<SearchNearbyResponse> {
  const response = await fetch(
    `${GOOGLE_MAPS_PLACES_URL}/places:searchNearby`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.location,places.photos,places.primaryType,places.shortFormattedAddress',
      },
      body: JSON.stringify({
        maxResultCount: 5,
        rankPreference: 'DISTANCE',
        includedPrimaryTypes: NEARBY_TYPES,
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: SEARCH_RADIUS,
          },
        },
      }),
    },
  );
  if (!response.ok) throw new Error('Could not find nearby places');
  return response.json();
}
