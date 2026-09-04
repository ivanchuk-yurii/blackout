import { type Tables } from '@/lib/supabase/types';

export type SpotPlace = Pick<Tables<'spots'>, 'lat' | 'lon' | 'image'>;

export interface SpotOption {
  id: string;
  label: string;
  emoji: string;
  address?: string;
  place?: SpotPlace;
  distance?: number;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Text {
  text: string;
}

export interface Photo {
  name: string;
}

export interface Place {
  id: string;
  displayName: Text;
  location: LatLng;
  photos?: Photo[];
  primaryType?: string;
  shortFormattedAddress?: string;
}

export interface SearchNearbyResponse {
  places?: Place[];
}

export interface StructuredFormat {
  mainText: Text;
  secondaryText?: Text;
}

export interface PlacePrediction {
  placeId: string;
  text: Text;
  structuredFormat?: StructuredFormat;
  types?: string[];
  distanceMeters?: number;
}

export interface Suggestion {
  placePrediction?: PlacePrediction;
}

export interface AutocompletePlacesResponse {
  suggestions?: Suggestion[];
}

export interface RoutePolyline {
  encodedPolyline: string;
}

export interface ComputedRoute {
  polyline?: RoutePolyline;
  distanceMeters?: number;
}

export interface ComputeRoutesResponse {
  routes?: ComputedRoute[];
}
