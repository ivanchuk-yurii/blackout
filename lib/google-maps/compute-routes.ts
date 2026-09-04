import { GOOGLE_MAPS_ROUTES_URL } from './const';
import {
  ComputedRoute,
  type ComputeRoutesResponse,
  type LatLng,
} from './types';

function waypoint({ latitude, longitude }: LatLng) {
  return { location: { latLng: { latitude, longitude } } };
}

export async function computeWalkingRoute(
  origin: LatLng,
  destination: LatLng,
  intermediates: LatLng[] = [],
): Promise<ComputedRoute | void> {
  const response = await fetch(`${GOOGLE_MAPS_ROUTES_URL}:computeRoutes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      'X-Goog-FieldMask':
        'routes.polyline.encodedPolyline,routes.distanceMeters',
    },
    body: JSON.stringify({
      origin: waypoint(origin),
      destination: waypoint(destination),
      intermediates: intermediates.map(waypoint),
      travelMode: 'WALK',
    }),
  });
  if (!response.ok) throw new Error('Could not find route');

  const { routes }: ComputeRoutesResponse = await response.json();
  return routes?.[0];
}
