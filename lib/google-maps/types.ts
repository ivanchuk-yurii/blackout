import { type Tables } from '@/lib/supabase/types';

export type SpotPlace = Pick<Tables<'spots'>, 'lat' | 'lon' | 'image'>;

export interface SpotOption {
  id: string;
  label: string;
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
}

export interface SearchNearbyResponse {
  places?: Place[];
}

export interface PlacePrediction {
  placeId: string;
  text: Text;
  distanceMeters?: number;
}

export interface Suggestion {
  placePrediction?: PlacePrediction;
}

export interface AutocompletePlacesResponse {
  suggestions?: Suggestion[];
}
