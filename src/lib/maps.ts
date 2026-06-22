import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

let configured = false

function ensureConfigured() {
  if (configured) return
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) throw new Error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
  setOptions({ key, v: 'weekly' })
  configured = true
}

const cache = new Map<string, Promise<void>>()

export function loadLib(lib: 'places' | 'maps' | 'marker'): Promise<void> {
  if (cache.has(lib)) return cache.get(lib)!
  try {
    ensureConfigured()
  } catch (e) {
    return Promise.reject(e)
  }
  const p = importLibrary(lib).then(() => undefined)
  cache.set(lib, p)
  return p
}
