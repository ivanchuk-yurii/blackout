'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { type Tables } from '@/lib/supabase/types';
import { autocomplete } from '@/lib/google-maps/autocomplete';
import { fetchDetails } from '@/lib/google-maps/fetch-details';
import { searchNearby } from '@/lib/google-maps/search-nearby';
import { formatDistance, photoUrl } from '@/lib/google-maps/utils';
import {
  type AutocompletePlacesResponse,
  type LatLng,
  type Place,
  type SpotPlace,
  type SpotOption,
} from '@/lib/google-maps/types';

function toSpotFields(place: Place): SpotPlace {
  return {
    lat: place.location.latitude,
    lon: place.location.longitude,
    image: place.photos?.[0]?.name ?? null,
  };
}

export function Spots({
  hangoutId,
  canAdd,
  spots: initialSpots,
}: {
  hangoutId: string;
  canAdd: boolean;
  spots: Tables<'spots'>[];
}) {
  const [spots, setSpots] = useState(initialSpots);
  const [nearbySuggestions, setNearbySuggestions] = useState<SpotOption[]>([]);
  const [predictions, setPredictions] = useState<SpotOption[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [pending, setPending] = useState(false);

  const coords = useRef<LatLng | null>(null);
  // One session token spans all keystrokes of a search plus the closing Place
  // Details call, so Google bills the burst as a single autocomplete session.
  const sessionToken = useRef<string | null>(null);
  // Guards against out-of-order autocomplete responses on fast typing.
  const requestSeq = useRef(0);

  const displayed = query.trim() ? predictions : nearbySuggestions;

  async function runAutocomplete(value: string) {
    const seq = ++requestSeq.current;

    if (!value.trim()) {
      setPredictions([]);
      sessionToken.current = null;
      return;
    }
    if (!sessionToken.current) sessionToken.current = crypto.randomUUID();

    let response: AutocompletePlacesResponse;
    try {
      response = await autocomplete(value, {
        sessionToken: sessionToken.current,
        origin: coords.current,
      });
    } catch {
      return;
    }
    // Ignore responses that a newer keystroke has superseded.
    if (seq !== requestSeq.current) return;
    setPredictions(
      (response.suggestions ?? [])
        .map((suggestion) => suggestion.placePrediction)
        .filter((prediction) => prediction != null)
        .map((prediction) => ({
          id: prediction.placeId,
          label: prediction.text.text,
          distance: prediction.distanceMeters,
        })),
    );
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelectedId('');
    void runAutocomplete(value);
  }

  async function handleAdd() {
    const chosen = displayed.find((s) => s.id === selectedId);
    if (!chosen) return;

    setPending(true);
    setError(null);

    let place = chosen.place ?? null;
    if (!place) {
      const details = await fetchDetails(chosen.id, sessionToken.current);
      sessionToken.current = null;
      place = details ? toSpotFields(details) : null;
    }
    if (!place) {
      setPending(false);
      setError('Could not load place details');
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('spots')
      .insert({
        hangout_id: hangoutId,
        google_maps_id: chosen.id,
        name: chosen.label,
        lat: place.lat,
        lon: place.lon,
        image: place.image,
      })
      .select()
      .single();
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSpots((current) => [...current, data]);
    setQuery('');
    setPredictions([]);
    setSelectedId('');
    sessionToken.current = null;
  }

  // On page load: get the user's location and show the nearest matching spots.
  useEffect(() => {
    if (!canAdd || !navigator.geolocation) return;

    let cancelled = false;
    const load = async () => {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          coords.current = { latitude, longitude };
          try {
            const response = await searchNearby(latitude, longitude);
            const results = (response.places ?? []).map((place) => ({
              id: place.id,
              label: place.displayName.text,
              place: toSpotFields(place),
            }));
            if (!cancelled) setNearbySuggestions(results);
          } catch (cause) {
            if (!cancelled) setError((cause as Error).message);
          } finally {
            if (!cancelled) setLocating(false);
          }
        },
        () => {
          if (cancelled) return;
          setLocating(false);
          // No location: the text search still works, just without bias.
        },
      );
    };
    void load();

    return () => {
      cancelled = true;
    };
  }, [canAdd]);

  return (
    <section>
      <h2>Spots</h2>

      {error && <p role="alert">{error}</p>}

      <ul>
        {spots.map((spot) => (
          <li key={spot.id}>
            {spot.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl(spot.image)}
                alt={spot.name}
                width={80}
                height={80}
              />
            )}
            {spot.name}
          </li>
        ))}
      </ul>

      {canAdd && (
        <div>
          <input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search for a place…"
          />
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            <option value="" disabled>
              {locating ? 'Finding places near you…' : 'Select a place…'}
            </option>
            {displayed.map((suggestion) => (
              <option key={suggestion.id} value={suggestion.id}>
                {suggestion.distance != null
                  ? `${suggestion.label} · ${formatDistance(suggestion.distance)}`
                  : suggestion.label}
              </option>
            ))}
          </select>
          <button onClick={handleAdd} disabled={pending || !selectedId}>
            Add
          </button>
        </div>
      )}
    </section>
  );
}
