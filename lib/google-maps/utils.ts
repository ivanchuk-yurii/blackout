import { GOOGLE_MAPS_PLACES_URL, GOOGLE_MAPS_API_URL } from './const';
import { type LatLng } from './types';

const EARTH_RADIUS = 6371008.8;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function mapsScriptUrl() {
  return `${GOOGLE_MAPS_API_URL}/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}&libraries=geometry,marker`;
}

export function directionsUrl(lat: number, lon: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

export function photoUrl(name: string) {
  return `${GOOGLE_MAPS_PLACES_URL}/${name}/media?maxWidthPx=400&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}`;
}

export function distanceBetween(from: LatLng, to: LatLng) {
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);
  const deltaLat = toLat - fromLat;
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLon / 2) ** 2;

  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(a));
}

export function formatDistance(meters: number) {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}
