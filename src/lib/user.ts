import { LocalUser } from '@/types'
import { supabase } from './supabase'

const USER_KEY = 'dontblackout_user'
const NIGHT_OUTS_KEY = 'dontblackout_nights'

export function getLocalUser(): LocalUser | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(USER_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function setLocalUser(user: LocalUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export async function createUser(name: string): Promise<LocalUser> {
  const { data, error } = await supabase
    .from('users')
    .insert({ name: name.trim() })
    .select()
    .single()
  if (error) throw error
  const user: LocalUser = { id: data.id, name: data.name }
  setLocalUser(user)
  return user
}

export function getStoredNightOutIds(): string[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(NIGHT_OUTS_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function addStoredNightOutId(id: string): void {
  const ids = getStoredNightOutIds()
  if (!ids.includes(id)) {
    localStorage.setItem(NIGHT_OUTS_KEY, JSON.stringify([...ids, id]))
  }
}

export function removeStoredNightOutId(id: string): void {
  const ids = getStoredNightOutIds()
  localStorage.setItem(NIGHT_OUTS_KEY, JSON.stringify(ids.filter(i => i !== id)))
}
