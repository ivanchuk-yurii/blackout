'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'
import { addStoredNightOutId } from '@/lib/user'

export default function JoinPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [status, setStatus] = useState<'joining' | 'error'>('joining')

  useEffect(() => {
    if (userLoading) return
    if (!user) { router.replace(`/?join=${id}`); return }
    join()
  }, [userLoading, user])

  async function join() {
    try {
      const { data: night, error } = await supabase
        .from('night_outs')
        .select('id, status')
        .eq('id', id)
        .single()

      if (error || !night) { setStatus('error'); return }

      await supabase
        .from('night_out_participants')
        .upsert({ night_out_id: id, user_id: user!.id }, { onConflict: 'night_out_id,user_id' })

      addStoredNightOutId(id)

      if (night.status === 'finished') {
        router.replace(`/night/${id}/stats`)
      } else {
        router.replace(`/night/${id}`)
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
        <p className="text-xl">😕</p>
        <p className="text-white font-semibold">Night out not found</p>
        <button onClick={() => router.push('/')} className="text-violet-400 hover:text-violet-300 text-sm">
          Go home
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <span className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Joining night out…</p>
    </div>
  )
}
