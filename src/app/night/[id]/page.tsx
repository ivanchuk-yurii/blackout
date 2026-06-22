'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, QrCode, Plus, CheckCircle, LogOut, Trash2, ChevronRight, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'
import { removeStoredNightOutId } from '@/lib/user'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import PlacesSearch from '@/components/PlacesSearch'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import { NightOut, Bar, NightOutParticipant } from '@/types'
import { formatShortDate, formatTime } from '@/lib/utils'

export default function NightOutPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useUser()
  const router = useRouter()

  const [night, setNight] = useState<NightOut | null>(null)
  const [bars, setBars] = useState<Bar[]>([])
  const [participants, setParticipants] = useState<NightOutParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [qrOpen, setQrOpen] = useState(false)
  const [addBarOpen, setAddBarOpen] = useState(false)
  const [barName, setBarName] = useState('')
  const [barCoords, setBarCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null })
  const [addingBar, setAddingBar] = useState(false)
  const [barError, setBarError] = useState('')
  const [finishing, setFinishing] = useState(false)
  const [joinUrl, setJoinUrl] = useState('')

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join/${id}`)
  }, [id])

  const loadData = useCallback(async () => {
    const [nightRes, barsRes, partRes] = await Promise.all([
      supabase.from('night_outs').select('*').eq('id', id).single(),
      supabase.from('bars').select('*').eq('night_out_id', id).order('created_at'),
      supabase.from('night_out_participants').select('*, user:users(*)').eq('night_out_id', id),
    ])
    if (nightRes.data) setNight(nightRes.data as NightOut)
    if (barsRes.data) setBars(barsRes.data as Bar[])
    if (partRes.data) setParticipants(partRes.data as NightOutParticipant[])
    setLoading(false)
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Realtime subscription for bars and participants
  useEffect(() => {
    const channel = supabase
      .channel(`night-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bars', filter: `night_out_id=eq.${id}` },
        () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'night_out_participants', filter: `night_out_id=eq.${id}` },
        () => loadData())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'night_outs', filter: `id=eq.${id}` },
        () => loadData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id, loadData])

  async function addBar() {
    if (!user || !barName.trim()) { setBarError('Enter a bar name'); return }
    setAddingBar(true)
    try {
      const { data, error } = await supabase
        .from('bars')
        .insert({
          night_out_id: id,
          name: barName.trim(),
          added_by: user.id,
          latitude: barCoords.lat,
          longitude: barCoords.lng,
        })
        .select()
        .single()
      if (error) throw error
      setBars(prev => [...prev, data as Bar])
      setBarName('')
      setAddBarOpen(false)
      router.push(`/night/${id}/bar/${data.id}`)
    } catch {
      setBarError('Failed to add bar')
    } finally {
      setAddingBar(false)
    }
  }

  async function deleteBar(barId: string) {
    await supabase.from('bars').delete().eq('id', barId)
    setBars(prev => prev.filter(b => b.id !== barId))
  }

  async function finishBar(barId: string) {
    const { data } = await supabase
      .from('bars')
      .update({ status: 'finished', finished_at: new Date().toISOString() })
      .eq('id', barId)
      .select()
      .single()
    if (data) setBars(prev => prev.map(b => b.id === barId ? data as Bar : b))
  }

  async function finishNightOut() {
    if (!user || !night) return
    setFinishing(true)
    await supabase
      .from('night_outs')
      .update({ status: 'finished', finished_at: new Date().toISOString() })
      .eq('id', id)
    router.push(`/night/${id}/stats`)
  }

  async function leaveNightOut() {
    if (!user) return
    await supabase.from('night_out_participants').delete().eq('night_out_id', id).eq('user_id', user.id)
    removeStoredNightOutId(id)
    router.push('/')
  }

  async function deleteNightOut() {
    await supabase.from('night_outs').delete().eq('id', id)
    removeStoredNightOutId(id)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!night) return <div className="pt-8 text-gray-400">Night out not found.</div>

  const isCreator = user?.id === night.creator_id
  const activeBar = bars.find(b => b.status === 'active')
  const pastBars = bars.filter(b => b.status === 'finished')
  const canAddBar = night.status === 'active' && !activeBar

  return (
    <div className="flex flex-col gap-5 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{night.name}</h1>
          <p className="text-gray-500 text-xs">{formatShortDate(night.created_at)}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          night.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'
        }`}>
          {night.status === 'active' ? 'Active' : 'Finished'}
        </span>
      </div>

      {/* Participants */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={16} />
            <span className="text-sm font-medium">{participants.length} people</span>
          </div>
          {night.status === 'active' && (
            <button
              onClick={() => setQrOpen(true)}
              className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm transition-colors"
            >
              <QrCode size={16} /> Invite
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {participants.map(p => (
            <span key={p.id} className="text-sm bg-gray-800 text-gray-300 px-2.5 py-1 rounded-lg">
              {(p.user as { name: string } | undefined)?.name ?? 'Unknown'}
              {p.user_id === night.creator_id && (
                <span className="ml-1 text-violet-400 text-xs">★</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Active bar */}
      {activeBar && (
        <div className="bg-violet-600/10 border border-violet-500/30 rounded-xl p-4">
          <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-2">Currently at</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">{activeBar.name}</p>
              <p className="text-gray-400 text-xs">Since {formatTime(activeBar.created_at)}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Button onClick={() => router.push(`/night/${id}/bar/${activeBar.id}`)}>
                <ChevronRight size={16} className="mr-1" /> Enter
              </Button>
              <div className="flex gap-1">
                <button onClick={() => finishBar(activeBar.id)} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  <CheckCircle size={13} /> Finish bar
                </button>
                <span className="text-gray-600">·</span>
                <button onClick={() => deleteBar(activeBar.id)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add bar button */}
      {canAddBar && (
        <Button
          variant="secondary"
          onClick={() => { setAddBarOpen(true); setBarName(''); setBarCoords({ lat: null, lng: null }); setBarError('') }}
          className="w-full"
        >
          <Plus size={18} className="mr-1.5" /> Add bar
        </Button>
      )}

      {!canAddBar && !activeBar && night.status === 'active' && (
        <p className="text-center text-gray-500 text-sm">Finish the current bar before adding another.</p>
      )}

      {/* Past bars */}
      {pastBars.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Past bars</p>
          {pastBars.map(bar => (
            <div key={bar.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
              <button
                onClick={() => router.push(`/night/${id}/bar/${bar.id}`)}
                className="flex-1 text-left"
              >
                <p className="text-white text-sm font-medium">{bar.name}</p>
                <p className="text-gray-500 text-xs">
                  {formatTime(bar.created_at)}
                  {bar.finished_at ? ` – ${formatTime(bar.finished_at)}` : ''}
                </p>
              </button>
              <button onClick={() => deleteBar(bar.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer actions */}
      {night.status === 'active' && (
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
          {isCreator ? (
            <>
              <Button size="lg" variant="secondary" onClick={finishNightOut} loading={finishing}>
                <CheckCircle size={18} className="mr-1.5" /> Finish night out
              </Button>
              <Button size="lg" variant="danger" onClick={deleteNightOut}>
                <Trash2 size={18} className="mr-1.5" /> Delete night out
              </Button>
            </>
          ) : (
            <Button size="lg" variant="secondary" onClick={leaveNightOut}>
              <LogOut size={18} className="mr-1.5" /> Leave night out
            </Button>
          )}
        </div>
      )}

      {night.status === 'finished' && (
        <Button size="lg" onClick={() => router.push(`/night/${id}/stats`)}>
          View stats
        </Button>
      )}

      {/* QR Modal */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Invite friends">
        <QRCodeDisplay url={joinUrl} title="Scan to join this night out" />
      </Modal>

      {/* Add bar modal */}
      <Modal open={addBarOpen} onClose={() => setAddBarOpen(false)} title="Add bar">
        <div className="flex flex-col gap-3">
          <PlacesSearch
            value={barName}
            onChange={v => { setBarName(v); setBarError('') }}
            onCoords={(lat, lng) => setBarCoords({ lat, lng })}
            error={barError}
            onKeyDown={e => e.key === 'Enter' && addBar()}
          />
          <Button size="lg" loading={addingBar} onClick={addBar}>
            Add bar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
