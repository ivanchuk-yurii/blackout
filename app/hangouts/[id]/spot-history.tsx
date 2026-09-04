'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { computeWalkingRoute } from '@/lib/google-maps/compute-routes';
import { markerContent } from '@/lib/google-maps/marker-content';
import { formatDistance, mapsScriptUrl } from '@/lib/google-maps/utils';
import { type Spot } from './select-spot';

const BOUNDS_PADDING = 64;

export function SpotHistory({ spots }: { spots: Spot[] }) {
  const [ready, setReady] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const lineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!ready || !containerRef.current || spots.length === 0) return;

    mapRef.current ??= new google.maps.Map(containerRef.current, {
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!,
      colorScheme: google.maps.ColorScheme.DARK,
      disableDefaultUI: true,
      zoomControl: true,
    });
    const map = mapRef.current;

    for (const marker of markersRef.current) marker.map = null;
    markersRef.current = spots.map(
      (spot) =>
        new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: spot.lat, lng: spot.lon },
          anchorLeft: '-6px',
          anchorTop: '-50%',
          title: spot.name,
          content: markerContent(spot.name),
        }),
    );

    if (spots.length === 1) {
      map.setCenter({ lat: spots[0].lat, lng: spots[0].lon });
      map.setZoom(16);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    for (const spot of spots) bounds.extend({ lat: spot.lat, lng: spot.lon });
    map.fitBounds(bounds, BOUNDS_PADDING);

    const waypoints = spots.map((spot) => ({
      latitude: spot.lat,
      longitude: spot.lon,
    }));

    const load = async () => {
      let polyline: string | undefined;

      try {
        const response = await computeWalkingRoute(
          waypoints[0],
          waypoints[waypoints.length - 1],
          waypoints.slice(1, -1),
        );
        polyline = response?.polyline?.encodedPolyline;
        setDistance(response?.distanceMeters ?? null);
      } catch {}

      const path: (google.maps.LatLng | google.maps.LatLngLiteral)[] = polyline
        ? google.maps.geometry.encoding.decodePath(polyline)
        : spots.map((spot) => ({ lat: spot.lat, lng: spot.lon }));

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

      const routeBounds = new google.maps.LatLngBounds();
      for (const point of path) routeBounds.extend(point);
      map.fitBounds(routeBounds, BOUNDS_PADDING);
    };
    void load();
  }, [ready, spots]);

  return (
    <>
      <div className="my-2">
        <p className="px-1 pb-2 font-heading text-lg font-medium tabular-nums">
          {spots.length} {spots.length === 1 ? 'spot' : 'spots'}
          {distance != null && ` · ${formatDistance(distance)} total`}
        </p>

        <div
          ref={containerRef}
          className="h-60 w-full overflow-hidden rounded-2xl border border-border"
        />
      </div>

      <Script
        id="google-maps"
        src={mapsScriptUrl()}
        onReady={() => setReady(true)}
      />
    </>
  );
}
