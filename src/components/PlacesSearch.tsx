'use client'

import { useEffect, useRef, useState } from 'react'
import { loadLib } from '@/lib/maps'
import { Search, MapPin, LocateFixed, Loader2 } from 'lucide-react'

interface Suggestion {
  placeId: string
  mainText: string
  secondaryText: string
  lat: number | null
  lng: number | null
  // kept to resolve coords on selection for autocomplete suggestions
  _prediction: google.maps.places.PlacePrediction | null
}

interface PlacesSearchProps {
  value: string
  onChange: (value: string) => void
  onCoords?: (lat: number | null, lng: number | null) => void
  error?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function PlacesSearch({ value, onChange, onCoords, error, onKeyDown }: PlacesSearchProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [apiReady, setApiReady] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadLib('places')
      .then(() => {
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
        setApiReady(true)
      })
      .catch(() => {})
  }, [])

  function finish(name: string, lat: number | null, lng: number | null) {
    onChange(name)
    setSuggestions([])
    setOpen(false)
    setLocationError('')
    onCoords?.(lat, lng)
    if (apiReady) sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
    inputRef.current?.focus()
  }

  function handleChange(val: string) {
    onChange(val)
    setLocationError('')
    clearTimeout(debounceRef.current)
    if (!val.trim() || !apiReady) { setSuggestions([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const { suggestions: raw } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: val,
          sessionToken: sessionTokenRef.current ?? undefined,
          includedPrimaryTypes: ['bar', 'restaurant', 'night_club', 'cafe'],
          locationRestriction: { south: 51.28, west: -0.51, north: 51.69, east: 0.33 },
        })
        const mapped = raw.slice(0, 5).flatMap(s => {
          const p = s.placePrediction
          if (!p) return []
          return [{
            placeId: p.placeId,
            mainText: p.mainText?.text ?? '',
            secondaryText: p.secondaryText?.text ?? '',
            lat: null,
            lng: null,
            _prediction: p,
          }]
        })
        setSuggestions(mapped)
        setOpen(mapped.length > 0)
      } catch {
        setSuggestions([])
        setOpen(false)
      }
    }, 300)
  }

  async function selectSuggestion(s: Suggestion) {
    let lat = s.lat
    let lng = s.lng
    // Autocomplete suggestions don't carry coords — fetch them now
    if (lat === null && s._prediction) {
      try {
        const place = s._prediction.toPlace()
        await place.fetchFields({ fields: ['location'] })
        lat = place.location?.lat() ?? null
        lng = place.location?.lng() ?? null
      } catch { /* coords remain null */ }
    }
    finish(s.mainText, lat, lng)
  }

  async function handleNearMe() {
    if (!apiReady || locating) return
    setLocationError('')
    setLocating(true)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      )
      const { latitude: lat, longitude: lng } = pos.coords
      const { places } = await google.maps.places.Place.searchNearby({
        fields: ['id', 'displayName', 'shortFormattedAddress', 'location'],
        includedPrimaryTypes: ['bar', 'pub', 'restaurant', 'night_club', 'cafe'],
        locationRestriction: { center: { lat, lng }, radius: 500 },
        maxResultCount: 8,
        rankPreference: 'POPULARITY' as google.maps.places.SearchNearbyRankPreferenceString,
      })
      const mapped = places.flatMap(p =>
        p.displayName
          ? [{
              placeId: p.id,
              mainText: p.displayName,
              secondaryText: p.shortFormattedAddress ?? '',
              lat: p.location?.lat() ?? null,
              lng: p.location?.lng() ?? null,
              _prediction: null,
            }]
          : []
      )
      setSuggestions(mapped)
      setOpen(mapped.length > 0)
    } catch (e) {
      const isGeoError = e instanceof GeolocationPositionError
      setLocationError(isGeoError ? 'Location access denied' : 'Could not find nearby places')
    } finally {
      setLocating(false)
    }
  }

  const displayError = error || locationError

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          ref={inputRef}
          className={`w-full bg-gray-800 border ${displayError ? 'border-red-500' : 'border-gray-700'} rounded-xl px-10 py-3 pl-9 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors text-sm`}
          placeholder="Search for a bar or venue..."
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          autoFocus
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleNearMe}
          disabled={!apiReady || locating}
          title="Find bars near me"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-violet-400 disabled:opacity-40 transition-colors"
        >
          {locating
            ? <Loader2 size={16} className="animate-spin" />
            : <LocateFixed size={16} />
          }
        </button>
      </div>
      {displayError && <p className="text-red-400 text-xs mt-1 ml-1">{displayError}</p>}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bottom-full mb-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
          {suggestions.map(s => (
            <li key={s.placeId}>
              <button
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-start gap-3"
                onMouseDown={() => selectSuggestion(s)}
              >
                <MapPin size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{s.mainText}</p>
                  <p className="text-gray-500 text-xs truncate">{s.secondaryText}</p>
                </div>
              </button>
            </li>
          ))}
          {value.trim() && (
            <li className="border-t border-gray-700">
              <button
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors text-gray-400 text-sm italic"
                onMouseDown={() => finish(value.trim(), null, null)}
              >
                Use &ldquo;{value.trim()}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
