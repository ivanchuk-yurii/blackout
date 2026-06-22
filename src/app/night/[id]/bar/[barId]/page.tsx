'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Trash2, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'
import Button from '@/components/ui/Button'
import DrinkForm from '@/components/DrinkForm'
import DrinkCard from '@/components/DrinkCard'
import PhotoBooth from '@/components/PhotoBooth'
import { Bar, Drink, NightOut, BarPhoto } from '@/types'
import { calcPureAlcohol, formatTime } from '@/lib/utils'

export default function BarPage() {
  const { id, barId } = useParams<{ id: string; barId: string }>()
  const { user } = useUser()
  const router = useRouter()

  const [bar, setBar] = useState<Bar | null>(null)
  const [night, setNight] = useState<NightOut | null>(null)
  const [drinks, setDrinks] = useState<Drink[]>([])
  const [photos, setPhotos] = useState<BarPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [finishing, setFinishing] = useState(false)
  const [photoBooth, setPhotoBooth] = useState(false)

  useEffect(() => {
    loadData()
  }, [barId, user])

  // Realtime: update bar status when another user finishes or deletes it
  useEffect(() => {
    const channel = supabase
      .channel(`bar-${barId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bars', filter: `id=eq.${barId}` },
        payload => setBar(payload.new as Bar))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'bars', filter: `id=eq.${barId}` },
        () => router.replace(`/night/${id}`))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [barId])

  async function loadData() {
    if (!user) return
    const [barRes, nightRes, drinksRes, photosRes] = await Promise.all([
      supabase.from('bars').select('*').eq('id', barId).single(),
      supabase.from('night_outs').select('*').eq('id', id).single(),
      supabase.from('drinks').select('*').eq('bar_id', barId).eq('user_id', user.id).order('created_at'),
      supabase.from('bar_photos').select('*, user:users(name)').eq('bar_id', barId).order('created_at'),
    ])
    if (barRes.data) setBar(barRes.data as Bar)
    if (nightRes.data) setNight(nightRes.data as NightOut)
    if (drinksRes.data) setDrinks(drinksRes.data as Drink[])
    if (photosRes.data) setPhotos(photosRes.data as BarPhoto[])
    setLoading(false)
  }

  async function finishBar() {
    setFinishing(true)
    const { data } = await supabase
      .from('bars')
      .update({ status: 'finished', finished_at: new Date().toISOString() })
      .eq('id', barId)
      .select()
      .single()
    if (data) setBar(data as Bar)
    setFinishing(false)
  }

  async function deleteBar() {
    await supabase.from('bars').delete().eq('id', barId)
    router.push(`/night/${id}`)
  }

  const totalAlcohol = drinks.reduce((sum, d) => sum + calcPureAlcohol(d.volume_ml, d.abv_percent), 0)
  const totalPrice = drinks.reduce((sum, d) => sum + (d.price ?? 0), 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!bar) return <div className="pt-8 text-gray-400">Bar not found.</div>

  const isNightActive = night?.status === 'active'
  const isBarActive = bar.status === 'active'
  const canLog = isNightActive && isBarActive

  const photoUrls = (path: string) =>
    supabase.storage.from('bar-photos').getPublicUrl(path).data.publicUrl

  return (
    <div className="flex flex-col gap-5 pt-6">
      {photoBooth && user && (
        <PhotoBooth
          barId={barId}
          userId={user.id}
          onPhotoTaken={photo => setPhotos(prev => [photo, ...prev])}
          onClose={() => setPhotoBooth(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(`/night/${id}`)} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{bar.name}</h1>
          <p className="text-gray-500 text-xs">
            {formatTime(bar.created_at)}
            {bar.finished_at ? ` – ${formatTime(bar.finished_at)}` : ''}
          </p>
        </div>
        <button
          onClick={() => setPhotoBooth(true)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Photo booth"
        >
          <Camera size={22} />
        </button>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          bar.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'
        }`}>
          {bar.status === 'active' ? 'Active' : 'Done'}
        </span>
      </div>

      {/* Your stats */}
      {drinks.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{drinks.length}</p>
            <p className="text-gray-400 text-xs">drinks</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{totalAlcohol.toFixed(0)}</p>
            <p className="text-gray-400 text-xs">ml pure alc</p>
          </div>
          {totalPrice > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">${totalPrice.toFixed(0)}</p>
              <p className="text-gray-400 text-xs">spent</p>
            </div>
          )}
        </div>
      )}

      {/* Log drinks */}
      {canLog && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Log a drink</p>
          <DrinkForm
            barId={barId}
            barStatus={bar.status}
            onAdded={drink => setDrinks(prev => [...prev, drink])}
          />
        </div>
      )}

      {/* Drink list */}
      {drinks.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Your drinks</p>
          {drinks.map(drink => (
            <DrinkCard
              key={drink.id}
              drink={drink}
              onUpdated={updated => setDrinks(prev => prev.map(d => d.id === updated.id ? updated : d))}
              onDeleted={did => setDrinks(prev => prev.filter(d => d.id !== did))}
            />
          ))}
        </div>
      )}

      {drinks.length === 0 && !canLog && (
        <p className="text-center text-gray-500 text-sm py-6">No drinks logged at this bar.</p>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Photos</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {photos.map(photo => (
              <a
                key={photo.id}
                href={photoUrls(photo.storage_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-none"
              >
                <img
                  src={photoUrls(photo.storage_path)}
                  alt="Bar photo"
                  className="w-28 h-28 object-cover rounded-xl border border-gray-800"
                />
                {photo.user?.name && (
                  <p className="text-gray-500 text-xs mt-1 text-center">{photo.user.name}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Bar actions */}
      {isNightActive && (
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
          {isBarActive && (
            <Button size="lg" variant="secondary" onClick={finishBar} loading={finishing}>
              <CheckCircle size={18} className="mr-1.5" /> Finish at {bar.name}
            </Button>
          )}
          <Button size="lg" variant="danger" onClick={deleteBar}>
            <Trash2 size={18} className="mr-1.5" /> Delete bar
          </Button>
        </div>
      )}
    </div>
  )
}
