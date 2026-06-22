'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { NightOut, Bar, Drink, NightOutParticipant, User, BarPhoto } from '@/types'
import { calcPureAlcohol, formatShortDate, haversineKm, formatDistance } from '@/lib/utils'
import NightMap from '@/components/NightMap'
import { PREDEFINED_DRINKS } from '@/lib/drinks'

interface UserStats {
  user: User
  drinkCount: number
  barsVisited: number
  totalAlcohol: number
  totalPrice: number
  drinks: Drink[]
}

function drinkEmoji(type: string) {
  return PREDEFINED_DRINKS.find(d => d.type === type)?.emoji ?? '🍶'
}

export default function StatsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [night, setNight] = useState<NightOut | null>(null)
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [bars, setBars] = useState<Bar[]>([])
  const [photos, setPhotos] = useState<BarPhoto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [id])

  async function loadStats() {
    const [nightRes, barsRes, partRes] = await Promise.all([
      supabase.from('night_outs').select('*').eq('id', id).single(),
      supabase.from('bars').select('*').eq('night_out_id', id).order('created_at'),
      supabase.from('night_out_participants').select('*, user:users(*)').eq('night_out_id', id),
    ])

    if (!nightRes.data) { setLoading(false); return }
    const nightData = nightRes.data as NightOut
    const barsData = (barsRes.data ?? []) as Bar[]
    const participants = (partRes.data ?? []) as NightOutParticipant[]

    setNight(nightData)
    setBars(barsData)

    if (!barsData.length) { setLoading(false); return }

    const barIds = barsData.map(b => b.id)
    const [drinksRes, photosRes] = await Promise.all([
      supabase.from('drinks').select('*').in('bar_id', barIds).order('created_at'),
      supabase.from('bar_photos').select('*, user:users(name)').in('bar_id', barIds).order('created_at'),
    ])

    if (photosRes.data) setPhotos(photosRes.data as BarPhoto[])

    const allDrinks = drinksRes

    const drinks = (allDrinks.data ?? []) as Drink[]

    const stats: UserStats[] = participants.map(p => {
      const usr = p.user as User
      const userDrinks = drinks.filter(d => d.user_id === p.user_id)
      const visitedBarIds = new Set(userDrinks.map(d => d.bar_id))
      return {
        user: usr,
        drinkCount: userDrinks.length,
        barsVisited: visitedBarIds.size,
        totalAlcohol: userDrinks.reduce((s, d) => s + calcPureAlcohol(d.volume_ml, d.abv_percent), 0),
        totalPrice: userDrinks.reduce((s, d) => s + (d.price ?? 0), 0),
        drinks: userDrinks,
      }
    })

    stats.sort((a, b) => b.totalAlcohol - a.totalAlcohol)
    setUserStats(stats)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (!night) return <div className="pt-8 text-gray-400">Not found.</div>

  const groupBars = bars.length
  const groupDrinks = userStats.reduce((s, u) => s + u.drinkCount, 0)
  const groupAlcohol = userStats.reduce((s, u) => s + u.totalAlcohol, 0)
  const groupPrice = userStats.reduce((s, u) => s + u.totalPrice, 0)

  const barsWithCoords = bars.filter(b => b.latitude !== null && b.longitude !== null)
  const totalDistanceKm = barsWithCoords.slice(1).reduce((sum, bar, i) => {
    const prev = barsWithCoords[i]
    return sum + haversineKm(prev.latitude!, prev.longitude!, bar.latitude!, bar.longitude!)
  }, 0)
  const showMap = barsWithCoords.length >= 2

  return (
    <div className="flex flex-col gap-5 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{night.name}</h1>
          <p className="text-gray-500 text-xs">{formatShortDate(night.created_at)} · Final stats</p>
        </div>
        <Trophy size={20} className="text-violet-400" />
      </div>

      {/* Group summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Group total</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-white">{groupBars}</p>
            <p className="text-gray-400 text-xs mt-0.5">bars visited</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-white">{groupDrinks}</p>
            <p className="text-gray-400 text-xs mt-0.5">drinks logged</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold text-violet-400">{groupAlcohol.toFixed(0)}</p>
            <p className="text-gray-400 text-xs mt-0.5">ml pure alcohol</p>
          </div>
          {showMap && (
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold text-sky-400">{formatDistance(totalDistanceKm)}</p>
              <p className="text-gray-400 text-xs mt-0.5">distance traveled</p>
            </div>
          )}
          {groupPrice > 0 && (
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold text-emerald-400">${groupPrice.toFixed(0)}</p>
              <p className="text-gray-400 text-xs mt-0.5">total spent</p>
            </div>
          )}
        </div>
      </div>

      {/* Route map */}
      {showMap && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Route · {barsWithCoords.length} stops
          </p>
          <NightMap bars={bars} />
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Start</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> End</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" /> Stops</span>
          </div>
        </div>
      )}

      {/* Per-user stats */}
      {userStats.map((stat, idx) => (
        <div key={stat.user.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '👤'}</span>
            <h2 className="text-white font-bold">{stat.user.name}</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{stat.barsVisited}</p>
              <p className="text-gray-500 text-xs">bars</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{stat.drinkCount}</p>
              <p className="text-gray-500 text-xs">drinks</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-violet-400">{stat.totalAlcohol.toFixed(0)}</p>
              <p className="text-gray-500 text-xs">ml alc</p>
            </div>
          </div>
          {stat.totalPrice > 0 && (
            <p className="text-xs text-gray-500 mb-3">Spent: ${stat.totalPrice.toFixed(2)}</p>
          )}
          {stat.drinks.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {stat.drinks.map(d => (
                <span key={d.id} className="flex items-center gap-1 text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-lg">
                  <span>{drinkEmoji(d.drink_type)}</span>
                  <span>{d.name}</span>
                  <span className="text-gray-500">· {calcPureAlcohol(d.volume_ml, d.abv_percent).toFixed(1)}ml</span>
                </span>
              ))}
            </div>
          )}
          {stat.drinks.length === 0 && (
            <p className="text-gray-500 text-xs">No drinks logged.</p>
          )}
        </div>
      ))}

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Photos · {photos.length}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {photos.map(photo => {
              const url = supabase.storage.from('bar-photos').getPublicUrl(photo.storage_path).data.publicUrl
              const bar = bars.find(b => b.id === photo.bar_id)
              return (
                <a key={photo.id} href={url} target="_blank" rel="noopener noreferrer" className="relative group">
                  <img
                    src={url}
                    alt="Night out photo"
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl px-1.5 pb-1.5 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{photo.user?.name}</p>
                    {bar && <p className="text-gray-300 text-xs truncate">{bar.name}</p>}
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* Bars visited */}
      {bars.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bars visited</p>
          {bars.map((bar, i) => (
            <div key={bar.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
              <span className="text-gray-500 text-sm font-bold w-5">{i + 1}</span>
              <span className="text-white text-sm font-medium flex-1">{bar.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                bar.status === 'finished' ? 'bg-gray-700 text-gray-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {bar.status === 'finished' ? 'Done' : 'Active'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
