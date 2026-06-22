'use client'

import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { calcPureAlcohol } from '@/lib/utils'
import { PREDEFINED_DRINKS } from '@/lib/drinks'
import { Drink } from '@/types'
import Input from './ui/Input'

interface DrinkCardProps {
  drink: Drink
  onUpdated: (drink: Drink) => void
  onDeleted: (id: string) => void
}

function drinkEmoji(type: string) {
  return PREDEFINED_DRINKS.find(d => d.type === type)?.emoji ?? '🍶'
}

export default function DrinkCard({ drink, onUpdated, onDeleted }: DrinkCardProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: drink.name,
    volume_ml: String(drink.volume_ml),
    abv_percent: String(drink.abv_percent),
    price: drink.price ? String(drink.price) : '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function save() {
    const vol = parseFloat(form.volume_ml)
    const abv = parseFloat(form.abv_percent)
    if (!form.name.trim() || isNaN(vol) || vol <= 0 || isNaN(abv) || abv < 0 || abv > 100) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('drinks')
        .update({
          name: form.name.trim(),
          volume_ml: Math.round(vol),
          abv_percent: abv,
          price: form.price ? parseFloat(form.price) : null,
        })
        .eq('id', drink.id)
        .select()
        .single()
      if (error) throw error
      onUpdated(data as Drink)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    setDeleting(true)
    try {
      await supabase.from('drinks').delete().eq('id', drink.id)
      onDeleted(drink.id)
    } finally {
      setDeleting(false)
    }
  }

  const pureAlcohol = calcPureAlcohol(drink.volume_ml, drink.abv_percent)

  if (editing) {
    return (
      <div className="bg-gray-800 rounded-xl p-3 border border-violet-500/50 flex flex-col gap-2">
        <Input
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="Name"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={form.volume_ml}
            onChange={e => setForm(p => ({ ...p, volume_ml: e.target.value }))}
            placeholder="Volume (ml)"
            type="number"
            min="1"
          />
          <Input
            value={form.abv_percent}
            onChange={e => setForm(p => ({ ...p, abv_percent: e.target.value }))}
            placeholder="ABV (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <Input
          value={form.price}
          onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
          placeholder="Price (optional)"
          type="number"
          min="0"
          step="0.01"
        />
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            <Check size={16} /> Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"
          >
            <X size={16} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 flex items-center gap-3">
      <span className="text-2xl">{drinkEmoji(drink.drink_type)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{drink.name}</p>
        <p className="text-gray-400 text-xs">
          {drink.volume_ml}ml · {drink.abv_percent}% · {pureAlcohol.toFixed(1)}ml pure alcohol
          {drink.price ? ` · $${drink.price.toFixed(2)}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 text-gray-400 hover:text-white transition-colors"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={remove}
          disabled={deleting}
          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
