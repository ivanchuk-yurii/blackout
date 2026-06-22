'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { LocalUser } from '@/types'
import { getLocalUser, setLocalUser, createUser } from '@/lib/user'
import { supabase } from '@/lib/supabase'

interface UserContextValue {
  user: LocalUser | null
  loading: boolean
  initUser: (name: string) => Promise<void>
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  initUser: async () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const local = getLocalUser()
    if (local) {
      // Re-sync to DB in case it was wiped (dev resets, or first visit on a new device)
      supabase
        .from('users')
        .upsert({ id: local.id, name: local.name }, { onConflict: 'id', ignoreDuplicates: true })
        .then()
    }
    setUser(local)
    setLoading(false)
  }, [])

  async function initUser(name: string) {
    const newUser = await createUser(name)
    setUser(newUser)
    setLocalUser(newUser)
  }

  return (
    <UserContext.Provider value={{ user, loading, initUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
