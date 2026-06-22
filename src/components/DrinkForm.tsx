'use client'

import { useState } from 'react'
import { PREDEFINED_DRINKS } from '@/lib/drinks'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'
import Button from './ui/Button'
import Input from './ui/Input'
import { Drink, PredefinedDrink } from '@/types'

interface DrinkFormProps {
  barId: string
  barStatus: 'active' | 'finished'
  onAdded: (drink: Drink) => void
}

export default function DrinkForm({ barId, barStatus, onAdded }: DrinkFormProps) {
  const { user } = useUser()
  const [showCustom, setShowCustom] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [custom, setCustom] = useState({ name: '', volume_ml: '', abv_percent: '', price: '' })
  const [customLoading, setCustomLoading] = useState(false)
  const [error, setError] = useState('')

  async function addPredefined(drink: PredefinedDrink) {
    if (!user || barStatus !== 'active') return
    setAdding(drink.type)
    try {
      const { data, error } = await supabase
        .from('drinks')
        .insert({
          bar_id: barId,
          user_id: user.id,
          drink_type: drink.type,
          name: drink.name,
          volume_ml: drink.volume_ml,
          abv_percent: drink.abv_percent,
          price: null,
        })
        .select()
        .single()
      if (error) throw error
      onAdded(data as Drink)
    } catch {
      setError('Failed to log drink')
    } finally {
      setAdding(null)
    }
  }

  async function addCustom(e: React.FormEvent) {
    e.preventDefault()
    if (!user || barStatus !== 'active') return
    const vol = parseFloat(custom.volume_ml)
    const abv = parseFloat(custom.abv_percent)
    const price = custom.price ? parseFloat(custom.price) : null
    if (!custom.name.trim() || isNaN(vol) || vol <= 0 || isNaN(abv) || abv < 0 || abv > 100) {
      setError('Please fill in name, volume, and ABV correctly')
      return
    }
    setCustomLoading(true)
    try {
      const { data, error } = await supabase
        .from('drinks')
        .insert({
          bar_id: barId,
          user_id: user.id,
          drink_type: 'custom',
          name: custom.name.trim(),
          volume_ml: Math.round(vol),
          abv_percent: abv,
          price,
        })
        .select()
        .single()
      if (error) throw error
      onAdded(data as Drink)
      setCustom({ name: '', volume_ml: '', abv_percent: '', price: '' })
      setShowCustom(false)
    } catch {
      setError('Failed to log drink')
    } finally {
      setCustomLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="grid grid-cols-2 gap-2">
        {PREDEFINED_DRINKS.map(drink => (
          <button
            key={drink.type}
            onClick={() => addPredefined(drink)}
            disabled={adding !== null}
            className="flex flex-col items-center gap-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-3 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="text-2xl">{drink.emoji}</span>
            <span className="text-white text-sm font-medium">{drink.name}</span>
            <span className="text-gray-400 text-xs">{drink.volume_ml}ml · {drink.abv_percent}%</span>
          </button>
        ))}
      </div>

      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors py-1"
        >
          + Add custom drink
        </button>
      ) : (
        <form onSubmit={addCustom} className="flex flex-col gap-2 bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-sm font-medium text-white mb-1">Custom drink</p>
          <Input
            placeholder="Name (e.g. IPA, Mojito)"
            value={custom.name}
            onChange={e => setCustom(p => ({ ...p, name: e.target.value }))}
            maxLength={40}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Volume (ml)"
              type="number"
              min="1"
              max="2000"
              value={custom.volume_ml}
              onChange={e => setCustom(p => ({ ...p, volume_ml: e.target.value }))}
            />
            <Input
              placeholder="ABV (%)"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={custom.abv_percent}
              onChange={e => setCustom(p => ({ ...p, abv_percent: e.target.value }))}
            />
          </div>
          <Input
            placeholder="Price (optional)"
            type="number"
            min="0"
            step="0.01"
            value={custom.price}
            onChange={e => setCustom(p => ({ ...p, price: e.target.value }))}
          />
          <div className="flex gap-2">
            <Button type="submit" size="md" disabled={customLoading} className="flex-1">
              Log drink
            </Button>
            <Button type="button" variant="ghost" size="md" onClick={() => setShowCustom(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
