<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Don't Blackout — Project Specs

Social PWA for tracking drinks during a night out with friends.

## Stack
- Next.js 16 App Router, TypeScript, Tailwind CSS
- Supabase (PostgreSQL + Realtime + Storage)
- Vercel deployment target
- `qrcode.react`, `lucide-react`, `@googlemaps/js-api-loader`, `@types/google.maps`

## Local dev
- `supabase start` / `supabase stop` (Docker required)
- API: `http://127.0.0.1:54321`, Studio: `http://127.0.0.1:54323`
- `npm run dev` → `http://localhost:3000`
- After schema changes: `supabase db reset` (re-runs all migrations, clears data)
- Env vars in `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Identity / Auth
- No auth. User picks a name → UUID created in `users` table → stored in localStorage.
- `UserContext` (`src/context/UserContext.tsx`) reads localStorage on mount, upserts user back to DB (handles dev DB resets).
- `user` is `LocalUser | null` — null means not yet set. `loading: boolean` gates rendering.
- Night out IDs also stored in localStorage.

## Database schema

### migrations/20240101000000_init.sql
- **users** — id (uuid pk), name, created_at
- **night_outs** — id, name, creator_id→users, status ('active'|'finished'), created_at, finished_at
- **night_out_participants** — id, night_out_id, user_id. UNIQUE(night_out_id, user_id)
- **bars** — id, night_out_id, name, added_by→users, status ('active'|'finished'), created_at, finished_at, latitude (double precision, nullable), longitude (double precision, nullable)
- **drinks** — id, bar_id, user_id, drink_type ('beer'|'wine'|'shot'|'cocktail'|'custom'), name, volume_ml, abv_percent, price (nullable), created_at
- All tables: RLS enabled + `GRANT ALL TO anon` + open policies
- Realtime on: bars, night_out_participants, night_outs

### migrations/20240101000001_photos.sql
- **bar_photos** — id, bar_id→bars, user_id→users, storage_path, created_at
- Storage bucket `bar-photos` (public)

### migrations/20240101000002_bar_coords.sql
- Adds `latitude` and `longitude` columns to `bars`

## App flows

### Night out
- Creator starts → added as participant → `/night/[id]`
- Others join via QR code or pasting link/ID → `/join/[id]` → upsert participant → redirect
- Bars are sequential (one active at a time). Any participant can add/finish/delete a bar.
- Creator: finish night out, delete night out. Non-creator: leave, remove from local list.
- Adding a bar uses Google Places Autocomplete (`PlacesSearch` component) restricted to London bounds. Coordinates are fetched from the selected place and stored with the bar. Users can also use the "near me" button to find nearby venues, or type a name manually (no coords stored).

### Drink logging
- Predefined: Beer (500ml/5%), Wine (150ml/12%), Shot (40ml/40%), Cocktail (200ml/10%)
- Custom: name + volume_ml + abv_percent + optional price
- Users only see/edit their own drinks during active night
- `DrinkForm` receives `barStatus` prop — guards inserts on finished bars

### Realtime
- Night out page: subscribes to bars, night_out_participants, night_outs (filtered by night ID)
- Bar page: subscribes to bar by ID — updates status live, redirects on DELETE

### Stats (after night finished)
- Group totals + per-user breakdown sorted by alcohol (medal ranking)
- Distance walked tile (sky blue) shown if ≥2 bars have coordinates; calculated via Haversine formula
- Route map (`NightMap` component): dark Google Map with violet polyline + numbered markers (green=start, red=end, purple=middle). Only rendered if ≥2 bars have coordinates.
- Photo gallery: 3-column grid of all bar_photos from the night

### Photo booth
- Camera icon in bar page header → full-screen overlay
- Camera starts → 3-second countdown → white flash → auto-saves to Supabase Storage → closes
- Photos: `{barId}/{timestamp}.jpg` in `bar-photos` bucket
- Bar page: horizontal scroll strip. Stats page: full 3-column grid.

## Key files
```
src/app/page.tsx                         home: name entry + night out list
src/app/night/[id]/page.tsx              night out view + realtime
src/app/night/[id]/bar/[barId]/page.tsx  bar: drinks + photo booth
src/app/night/[id]/stats/page.tsx        stats + photo gallery
src/app/join/[id]/page.tsx               auto-join handler
src/components/PhotoBooth.tsx            full-screen countdown camera
src/components/DrinkForm.tsx             drink buttons + custom form
src/components/DrinkCard.tsx             drink item with inline edit
src/components/QRCodeDisplay.tsx         QR + copy link
src/context/UserContext.tsx              identity (localStorage + DB upsert)
src/components/PlacesSearch.tsx          Google Places Autocomplete + near-me search for adding bars
src/components/NightMap.tsx              dark Google Map with route polyline (stats page)
src/lib/maps.ts                          shared Google Maps API loader (singleton, used by PlacesSearch + NightMap)
src/lib/supabase.ts, user.ts, drinks.ts, utils.ts
src/types/index.ts
supabase/migrations/
```

## Key constraints
- `export const dynamic = 'force-dynamic'` on root layout (prevents SSR crash on missing env vars)
- No loading state uncertainty: `user` starts null, `loading` is true until localStorage is read
- DB resets wipe all data; UserContext upsert self-heals user records for dev

## Google Maps
- API key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`. Required: **Maps JavaScript API** + **Places API (New)** in Google Cloud Console.
- Loader: `src/lib/maps.ts` exports `loadLib(lib)` — call before using any `google.maps.*`. Singleton; safe to call from multiple components. Uses `@googlemaps/js-api-loader` functional API (`setOptions` + `importLibrary`).
- Places autocomplete uses `AutocompleteSuggestion.fetchAutocompleteSuggestions()` (new API, not deprecated `AutocompleteService`). Restricted to London bounds: `{ south: 51.28, west: -0.51, north: 51.69, east: 0.33 }`.
- Near-me search uses `Place.searchNearby()` with a 500m radius and `includedPrimaryTypes: ['bar', 'pub', 'restaurant', 'night_club', 'cafe']`.
- Autocomplete coordinate fetch: `prediction.toPlace()` → `place.fetchFields({ fields: ['location'] })` → `place.location?.lat()/lng()`. Called on selection, not upfront.
- `google.maps.Marker` (classic) used in `NightMap` — deprecated in favour of `AdvancedMarkerElement` but avoids needing a `mapId`.
