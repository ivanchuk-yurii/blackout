export interface User {
  id: string
  name: string
  created_at: string
}

export interface NightOut {
  id: string
  name: string
  creator_id: string
  status: 'active' | 'finished'
  created_at: string
  finished_at: string | null
}

export interface Bar {
  id: string
  night_out_id: string
  name: string
  added_by: string
  status: 'active' | 'finished'
  created_at: string
  finished_at: string | null
  latitude: number | null
  longitude: number | null
}

export interface Drink {
  id: string
  bar_id: string
  user_id: string
  drink_type: 'beer' | 'wine' | 'shot' | 'cocktail' | 'custom'
  name: string
  volume_ml: number
  abv_percent: number
  price: number | null
  created_at: string
}

export interface DrinkWithUser extends Drink {
  user: User
}

export interface NightOutParticipant {
  id: string
  night_out_id: string
  user_id: string
  joined_at: string
  user?: User
}

export interface LocalUser {
  id: string
  name: string
}

export interface BarPhoto {
  id: string
  bar_id: string
  user_id: string
  storage_path: string
  created_at: string
  user?: { name: string }
}

export interface PredefinedDrink {
  type: 'beer' | 'wine' | 'shot' | 'cocktail'
  name: string
  volume_ml: number
  abv_percent: number
  emoji: string
}
