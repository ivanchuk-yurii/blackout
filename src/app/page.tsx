'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, LogIn, Trash2, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'
import { getStoredNightOutIds, addStoredNightOutId, removeStoredNightOutId } from '@/lib/user'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { NightOut } from '@/types'
import { formatShortDate } from '@/lib/utils'

export default function Home() {
  const { user, loading: userLoading, initUser } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pendingJoin = searchParams.get('join')
  const [nightOuts, setNightOuts] = useState<NightOut[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [nightName, setNightName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  // Onboarding state
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState('')
  const [nameSaving, setNameSaving] = useState(false)

  useEffect(() => {
    if (userLoading) return
    if (!user) { setLoading(false); return }
    if (pendingJoin) { router.replace(`/join/${pendingJoin}`); return }
    loadNightOuts()
  }, [userLoading, user])

  async function loadNightOuts() {
    const ids = getStoredNightOutIds()
    if (!ids.length) { setLoading(false); return }
    const { data } = await supabase
      .from('night_outs')
      .select('*')
      .in('id', ids)
      .order('created_at', { ascending: false })
    setNightOuts((data as NightOut[]) ?? [])
    setLoading(false)
  }

  async function handleSetName(e: React.FormEvent) {
    e.preventDefault()
    if (!nameInput.trim()) { setNameError('Enter your name'); return }
    setNameSaving(true)
    try {
      await initUser(nameInput.trim())
    } catch {
      setNameError('Something went wrong, try again')
    } finally {
      setNameSaving(false)
    }
  }

  async function createNightOut() {
    if (!user || !nightName.trim()) { setError('Enter a name for tonight'); return }
    setCreating(true)
    try {
      const { data: night, error: err } = await supabase
        .from('night_outs')
        .insert({ name: nightName.trim(), creator_id: user.id })
        .select()
        .single()
      if (err) throw err
      await supabase.from('night_out_participants').insert({ night_out_id: night.id, user_id: user.id })
      addStoredNightOutId(night.id)
      router.push(`/night/${night.id}`)
    } catch {
      setError('Failed to create night out')
    } finally {
      setCreating(false)
    }
  }

  async function joinNightOut() {
    if (!user) return
    const input = joinCode.trim()
    if (!input) { setError('Enter a code or paste a link'); return }
    const nightId = input.includes('/') ? input.split('/').pop()! : input
    setJoining(true)
    try {
      const { data: night, error: err } = await supabase
        .from('night_outs')
        .select('*')
        .eq('id', nightId)
        .single()
      if (err || !night) { setError('Night out not found'); setJoining(false); return }
      await supabase
        .from('night_out_participants')
        .upsert({ night_out_id: nightId, user_id: user.id }, { onConflict: 'night_out_id,user_id' })
      addStoredNightOutId(nightId)
      router.push(`/night/${nightId}`)
    } catch {
      setError('Failed to join')
    } finally {
      setJoining(false)
    }
  }

  function deleteFromList(id: string) {
    removeStoredNightOutId(id)
    setNightOuts(prev => prev.filter(n => n.id !== id))
  }

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-dvh">
        <span className="w-6 h-6 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center min-h-dvh gap-6 px-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-white">Don&apos;t<br />Blackout 🍻</h1>
          <p className="text-gray-400">Track your night out with friends.</p>
        </div>
        <form onSubmit={handleSetName} className="flex flex-col gap-3">
          <Input
            label="What's your name?"
            placeholder="Your name"
            value={nameInput}
            onChange={e => { setNameInput(e.target.value); setNameError('') }}
            error={nameError}
            autoFocus
            maxLength={30}
          />
          <Button type="submit" size="lg" loading={nameSaving}>
            Let&apos;s go
          </Button>
        </form>
      </div>
    )
  }

  // Normal home screen
  return (
    <div className="flex flex-col gap-6 pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white">Don&apos;t Blackout</h1>
        <p className="text-gray-400 text-sm">Hey, {user.name} 👋</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => { setCreateOpen(true); setError(''); setNightName('') }} className="flex-1">
          <Plus size={18} className="mr-1.5" /> Start night out
        </Button>
        <Button variant="secondary" onClick={() => { setJoinOpen(true); setError(''); setJoinCode('') }} className="flex-1">
          <LogIn size={18} className="mr-1.5" /> Join
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="w-6 h-6 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
        </div>
      ) : nightOuts.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your nights out</p>
          {nightOuts.map(night => (
            <div key={night.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <button
                onClick={() => router.push(night.status === 'finished' ? `/night/${night.id}/stats` : `/night/${night.id}`)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{night.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      night.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {night.status === 'active' ? 'Active' : 'Finished'}
                    </span>
                    <span className="text-gray-500 text-xs">{formatShortDate(night.created_at)}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-600" />
              </button>
              <button
                onClick={() => deleteFromList(night.id)}
                className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-sm py-8">No nights out yet. Start one!</p>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Start night out">
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Tonight's name (e.g. Friday vibes)"
            value={nightName}
            onChange={e => { setNightName(e.target.value); setError('') }}
            error={error}
            autoFocus
            maxLength={60}
            onKeyDown={e => e.key === 'Enter' && createNightOut()}
          />
          <Button size="lg" loading={creating} onClick={createNightOut}>
            Let&apos;s go
          </Button>
        </div>
      </Modal>

      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Join night out">
        <div className="flex flex-col gap-3">
          <p className="text-gray-400 text-sm">Paste the join link or enter the night out ID.</p>
          <Input
            placeholder="Link or ID"
            value={joinCode}
            onChange={e => { setJoinCode(e.target.value); setError('') }}
            error={error}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && joinNightOut()}
          />
          <Button size="lg" loading={joining} onClick={joinNightOut}>
            Join
          </Button>
        </div>
      </Modal>
    </div>
  )
}
