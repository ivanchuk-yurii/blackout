'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Script from 'next/script';
import { createClient } from '@/lib/supabase/client';
import { type Tables } from '@/lib/supabase/types';
import { directionsUrl, mapsScriptUrl } from '@/lib/google-maps/utils';
import { formatRelativeTime } from '@/lib/utils/relative-time';

function hasLocation(
  alert: Tables<'sos_alerts'>,
): alert is Tables<'sos_alerts'> & { lat: number; lon: number } {
  return alert.lat != null && alert.lon != null;
}

export function SosMap({
  hangoutId,
  userId,
  alerts: initialAlerts,
}: {
  hangoutId: string;
  userId: string;
  alerts: Tables<'sos_alerts'>[];
}) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [ready, setReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef(new Map<string, google.maps.Marker>());

  const others = useMemo(
    () => alerts.filter((alert) => alert.user_id !== userId),
    [alerts, userId],
  );
  const located = useMemo(() => others.filter(hasLocation), [others]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`sos_alerts:${hangoutId}`).on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sos_alerts',
        filter: `hangout_id=eq.${hangoutId}`,
      },
      (payload) => {
        setAlerts((current) => {
          if (payload.eventType === 'DELETE') {
            const { user_id } = payload.old as Tables<'sos_alerts'>;
            return current.filter((alert) => alert.user_id !== user_id);
          }

          const alert = payload.new as Tables<'sos_alerts'>;
          const index = current.findIndex(
            (existing) => existing.user_id === alert.user_id,
          );
          if (index === -1) return [...current, alert];

          const next = [...current];
          next[index] = alert;
          return next;
        });
      },
    );

    void supabase.realtime.setAuth().then(() => channel.subscribe());

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [hangoutId]);

  useEffect(() => {
    const markers = markersRef.current;

    if (!ready || !containerRef.current || !located.length) {
      markers.clear();
      mapRef.current = null;
      return;
    }

    mapRef.current ??= new google.maps.Map(containerRef.current, {
      center: { lat: located[0].lat, lng: located[0].lon },
      zoom: 16,
      colorScheme: google.maps.ColorScheme.DARK,
      disableDefaultUI: true,
      zoomControl: true,
    });
    const map = mapRef.current;

    for (const alert of located) {
      const position = { lat: alert.lat, lng: alert.lon };
      const marker = markers.get(alert.user_id);
      if (marker) {
        marker.setPosition(position);
      } else {
        markers.set(
          alert.user_id,
          new google.maps.Marker({ map, position, title: alert.user_id }),
        );
      }
    }

    for (const [id, marker] of markers) {
      if (located.some((alert) => alert.user_id === id)) continue;
      marker.setMap(null);
      markers.delete(id);
    }
  }, [ready, located]);

  if (!others.length) return null;

  return (
    <section>
      <h2>SOS</h2>

      {located.length > 0 && (
        <>
          <div ref={containerRef} style={{ width: '100%', height: 400 }} />
          <Script
            id="google-maps"
            src={mapsScriptUrl()}
            onReady={() => setReady(true)}
          />
        </>
      )}

      <ul>
        {others.map((alert) => (
          <li key={alert.user_id}>
            <p>{alert.user_id}</p>
            <p>{formatRelativeTime(alert.updated_at)}</p>
            {hasLocation(alert) ? (
              <a
                href={directionsUrl(alert.lat, alert.lon)}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open in Maps
              </a>
            ) : (
              <p>No location shared</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
