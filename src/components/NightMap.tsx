'use client'

import { useEffect, useRef } from 'react'
import { loadLib } from '@/lib/maps'
import { Bar } from '@/types'

const DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#374151' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
]

interface NightMapProps {
  bars: Bar[]
}

export default function NightMap({ bars }: NightMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stops = bars
      .filter((b): b is Bar & { latitude: number; longitude: number } =>
        b.latitude !== null && b.longitude !== null
      )
      .map(b => ({ lat: b.latitude, lng: b.longitude, name: b.name }))

    if (stops.length < 2 || !containerRef.current) return

    let cancelled = false

    loadLib('maps').then(() => {
      if (cancelled || !containerRef.current) return

      const bounds = new google.maps.LatLngBounds()
      stops.forEach(s => bounds.extend(s))

      const map = new google.maps.Map(containerRef.current, {
        center: bounds.getCenter(),
        zoom: 14,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        styles: DARK_STYLE as any,
        disableDefaultUI: true,
        gestureHandling: 'none',
        keyboardShortcuts: false,
      })

      map.fitBounds(bounds, 48)

      new google.maps.Polyline({
        path: stops,
        geodesic: true,
        strokeColor: '#7c3aed',
        strokeOpacity: 0.9,
        strokeWeight: 3,
        map,
      })

      stops.forEach((stop, i) => {
        new google.maps.Marker({
          position: stop,
          map,
          title: stop.name,
          label: {
            text: String(i + 1),
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '11px',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: i === 0 ? '#10b981' : i === stops.length - 1 ? '#ef4444' : '#7c3aed',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        })
      })
    })

    return () => { cancelled = true }
  }, [bars])

  return <div ref={containerRef} className="w-full h-64 rounded-xl overflow-hidden" />
}
