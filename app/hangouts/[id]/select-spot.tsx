'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { createClient } from '@/lib/supabase/client';
import { type Tables } from '@/lib/supabase/types';
import { type Point } from '@/lib/supabase/custom-types';
import { autocomplete } from '@/lib/google-maps/autocomplete';
import { computeWalkingRoute } from '@/lib/google-maps/compute-routes';
import { fetchDetails } from '@/lib/google-maps/fetch-details';
import { searchNearby } from '@/lib/google-maps/search-nearby';
import { formatDistance, mapsScriptUrl } from '@/lib/google-maps/utils';
import { markerContent } from '@/lib/google-maps/marker-content';
import { placeEmoji } from '@/lib/google-maps/place-emoji';
import {
  type Place,
  type SpotPlace,
  type SpotOption,
} from '@/lib/google-maps/types';
import { IconSearch } from '@tabler/icons-react';
import { Field, FieldError } from '@/components/ui/field';
import { OverlayClose } from '@/components/common/overlay';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
} from '@/components/ui/combobox';
import { nanoid } from 'nanoid';

const BOUNDS_PADDING = 64;

function toSpotFields(place: Place): SpotPlace {
  return {
    lat: place.location.latitude,
    lon: place.location.longitude,
    image: place.photos?.[0]?.name ?? null,
  };
}

export type Spot = Pick<Tables<'spots'>, 'name' | 'lat' | 'lon'>;

export function SelectSpot({
  hangoutId,
  previous,
  current,
  onChange,
}: {
  hangoutId: string;
  previous: Spot | null;
  current: Point | null;
  onChange: (spot: Spot) => void;
}) {
  const [ready, setReady] = useState(false);
  const [nearbySuggestions, setNearbySuggestions] = useState<SpotOption[]>([]);
  const [predictions, setPredictions] = useState<SpotOption[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [pending, setPending] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const lineRef = useRef<google.maps.Polyline | null>(null);

  const sessionToken = useRef<string>(nanoid());
  const requestSeq = useRef(0);

  const displayed = query.trim() ? predictions : nearbySuggestions;

  const previousLat = previous?.lat;
  const previousLon = previous?.lon;
  const previousName = previous?.name;

  const currentLat = current?.lat;
  const currentLon = current?.lon;

  function distanceOf(suggestion: SpotOption) {
    if (suggestion.distance != null) return suggestion.distance;
    if (!ready || !current || !suggestion.place) return null;

    return google.maps.geometry.spherical.computeDistanceBetween(
      { lat: current.lat, lng: current.lon },
      { lat: suggestion.place.lat, lng: suggestion.place.lon },
    );
  }

  async function runAutocomplete(value: string) {
    const seq = ++requestSeq.current;

    if (!value.trim()) {
      setPredictions([]);
      return;
    }

    try {
      const response = await autocomplete(value, {
        sessionToken: sessionToken.current,
        origin: current
          ? { latitude: current.lat, longitude: current.lon }
          : null,
      });
      if (seq !== requestSeq.current) return;

      setPredictions(
        (response.suggestions ?? [])
          .map((suggestion) => suggestion.placePrediction)
          .filter((prediction) => prediction != null)
          .map((prediction) => ({
            id: prediction.placeId,
            label:
              prediction.structuredFormat?.mainText.text ??
              prediction.text.text,
            address: prediction.structuredFormat?.secondaryText?.text,
            emoji: placeEmoji(prediction.types),
            distance: prediction.distanceMeters,
          })),
      );
    } catch (cause) {
      if (seq !== requestSeq.current) return;

      setError((cause as Error).message);
      setPredictions([]);
    }
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    void runAutocomplete(value);
  }

  async function handleSelect(chosen: SpotOption | null) {
    if (!chosen) return;

    setPending(true);
    setError(null);

    let place = chosen.place ?? null;
    if (!place) {
      try {
        const response = await fetchDetails(chosen.id, sessionToken.current);
        place = response ? toSpotFields(response) : null;
      } catch {}
    }

    if (!place) {
      setPending(false);
      setError('Could not load place details');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('spots').insert({
      hangout_id: hangoutId,
      google_maps_id: chosen.id,
      name: chosen.label,
      lat: place.lat,
      lon: place.lon,
      image: place.image,
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }

    onChange({ name: chosen.label, lat: place.lat, lon: place.lon });
  }

  useEffect(() => {
    if (currentLat == null || currentLon == null) return;

    const load = async () => {
      setLoadingNearby(true);
      try {
        const response = await searchNearby(currentLat, currentLon);
        const results = (response.places ?? []).map((place) => ({
          id: place.id,
          label: place.displayName.text,
          address: place.shortFormattedAddress,
          emoji: placeEmoji(place.primaryType ? [place.primaryType] : []),
          place: toSpotFields(place),
        }));
        setNearbySuggestions(results);
      } catch (cause) {
        setError((cause as Error).message);
      } finally {
        setLoadingNearby(false);
      }
    };
    void load();
  }, [currentLat, currentLon]);

  useEffect(() => {
    if (!ready || !containerRef.current) return;

    const origin =
      previousLat != null && previousLon != null
        ? { lat: previousLat, lng: previousLon }
        : null;
    const destination =
      currentLat != null && currentLon != null
        ? { lat: currentLat, lng: currentLon }
        : null;

    if (!origin && !destination) return;

    mapRef.current ??= new google.maps.Map(containerRef.current, {
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!,
      colorScheme: google.maps.ColorScheme.DARK,
      disableDefaultUI: true,
      zoomControl: true,
    });
    const map = mapRef.current;

    for (const marker of markersRef.current) marker.map = null;
    markersRef.current = [];

    if (origin) {
      markersRef.current.push(
        new google.maps.marker.AdvancedMarkerElement({
          map,
          position: origin,
          anchorLeft: `-6px`,
          anchorTop: '-50%',
          title: previousName,
          content: markerContent(previousName ?? ''),
        }),
      );
    }

    if (destination) {
      markersRef.current.push(
        new google.maps.marker.AdvancedMarkerElement({
          map,
          position: destination,
          title: 'You',
        }),
      );
    }

    if (!origin || !destination) {
      lineRef.current?.setMap(null);
      lineRef.current = null;
      map.setCenter(origin ?? destination!);
      map.setZoom(16);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(destination);
    map.fitBounds(bounds, BOUNDS_PADDING);

    const load = async () => {
      let polyline: string | undefined;

      try {
        const response = await computeWalkingRoute(
          { latitude: origin.lat, longitude: origin.lng },
          { latitude: destination.lat, longitude: destination.lng },
        );
        polyline = response?.polyline?.encodedPolyline;
      } catch {}

      const path = polyline
        ? google.maps.geometry.encoding.decodePath(polyline)
        : [origin, destination];

      lineRef.current?.setMap(null);
      lineRef.current = new google.maps.Polyline({
        map,
        path,
        strokeOpacity: 0,
        icons: [
          {
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#ffffff',
              fillOpacity: polyline ? 1 : 0.5,
              strokeOpacity: 0,
              scale: 3,
            },
            offset: '0',
            repeat: '14px',
          },
        ],
      });

      if (polyline) {
        const routeBounds = new google.maps.LatLngBounds();
        for (const point of path) routeBounds.extend(point);
        map.fitBounds(routeBounds, BOUNDS_PADDING);
      }
    };
    void load();
  }, [ready, previousLat, previousLon, previousName, currentLat, currentLon]);

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-4 pb-0">
        <h1 className="text-2xl font-medium">It seems your location changed</h1>

        <OverlayClose />
      </div>

      <Field className="p-4">
        <Combobox
          items={displayed}
          filter={null}
          onValueChange={(option) => void handleSelect(option)}
          inputValue={query}
          onInputValueChange={handleQueryChange}
          itemToStringLabel={(option: SpotOption) => option.label}
        >
          <div className="relative">
            <IconSearch className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
            <ComboboxInput
              placeholder="Type new location name"
              disabled={pending}
              className="pl-9"
            />
          </div>

          <ComboboxContent side="bottom">
            <ComboboxEmpty>
              {loadingNearby ? 'Finding places near you…' : 'No places found'}
            </ComboboxEmpty>

            {displayed.map((suggestion) => {
              const distance = distanceOf(suggestion);

              return (
                <ComboboxItem
                  key={suggestion.id}
                  value={suggestion}
                  className="flex items-center gap-2 border border-dashed border-border bg-card p-2"
                >
                  <span className="flex w-10 shrink-0 flex-col items-center overflow-clip text-center">
                    <span className="-mb-1 text-lg leading-7">
                      {suggestion.emoji}
                    </span>
                    {distance != null && (
                      <span className="text-[10px] leading-4 text-muted-foreground">
                        {formatDistance(distance)}
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-sm leading-5 font-medium text-foreground">
                      {suggestion.label}
                    </span>
                    {suggestion.address && (
                      <span className="text-xs leading-4 text-muted-foreground">
                        {suggestion.address}
                      </span>
                    )}
                  </span>
                </ComboboxItem>
              );
            })}
          </ComboboxContent>
        </Combobox>

        <FieldError>{error}</FieldError>
      </Field>

      <div ref={containerRef} className="flex-1" />

      <Script
        id="google-maps"
        src={mapsScriptUrl()}
        onReady={() => setReady(true)}
      />
    </>
  );
}
