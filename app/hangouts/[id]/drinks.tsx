'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Constants, type Tables } from '@/lib/supabase/types';

export function Drinks({
  hangoutId,
  userId,
  canAdd,
  drinks: initialDrinkList,
  hangoutDrinks: initialDrinks,
}: {
  hangoutId: string;
  userId: string;
  canAdd: boolean;
  drinks: Tables<'drinks'>[];
  hangoutDrinks: Tables<'hangout_drinks'>[];
}) {
  const [drinks, setDrinks] = useState(initialDrinkList);
  const [drinkLogs, setDrinkLogs] = useState(initialDrinks);
  const [drinkId, setDrinkId] = useState('');
  const [volume, setVolume] = useState('');
  const [showDrinkForm, setShowDrinkForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<
    Tables<'drinks'>['category'] | ''
  >('');
  const [newAbv, setNewAbv] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const drinkName = (id: string) =>
    drinks.find((drink) => drink.id === id)?.name ?? id;

  const drinksByCategory = drinks.reduce<Record<string, typeof drinks>>(
    (groups, drink) => {
      (groups[drink.category] ??= []).push(drink);
      return groups;
    },
    {},
  );

  const selectedDrink = drinks.find((drink) => drink.id === drinkId);

  async function handleAddDrink() {
    if (!drinkId || !volume) return;

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('hangout_drinks')
      .insert({
        hangout_id: hangoutId,
        user_id: userId,
        drink_id: drinkId,
        volume: Number(volume),
      })
      .select()
      .single();
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDrinkLogs((current) => [...current, data]);
    setDrinkId('');
    setVolume('');
  }

  async function handleCreateDrink() {
    if (!newName || !newCategory || !newAbv) return;

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('drinks')
      .insert({
        name: newName,
        category: newCategory,
        abv: Number(newAbv),
        calories: newCalories ? Number(newCalories) : null,
        user_id: userId,
      })
      .select()
      .single();
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDrinks((current) => [...current, data]);
    setDrinkId(data.id);
    setVolume(data.volume != null ? String(data.volume) : '');
    setNewName('');
    setNewCategory('');
    setNewAbv('');
    setNewCalories('');
    setShowDrinkForm(false);
  }

  async function handleRemoveDrink(logId: string) {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangout_drinks')
      .delete()
      .eq('id', logId);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDrinkLogs((current) => current.filter((log) => log.id !== logId));
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}

      {canAdd && (
        <div>
          <select
            value={drinkId}
            onChange={(event) => {
              const drink = drinks.find((d) => d.id === event.target.value);
              setDrinkId(event.target.value);
              setVolume(drink?.volume != null ? String(drink.volume) : '');
            }}
          >
            <option value="" disabled>
              Select a drink…
            </option>
            {Object.entries(drinksByCategory).map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((drink) => (
                  <option key={drink.id} value={drink.id}>
                    {drink.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {selectedDrink && (
            <p>
              {selectedDrink.abv}% ABV · {selectedDrink.calories ?? '—'}{' '}
              kcal/100ml
            </p>
          )}
          <input
            type="number"
            min="0"
            max="10000"
            value={volume}
            onChange={(event) => setVolume(event.target.value)}
            placeholder="Volume (ml)"
            disabled={selectedDrink?.volume != null}
          />
          <button
            onClick={handleAddDrink}
            disabled={pending || !drinkId || !volume}
          >
            Add
          </button>
        </div>
      )}

      {canAdd && (
        <div>
          <button
            onClick={() => setShowDrinkForm((show) => !show)}
            disabled={pending}
          >
            {showDrinkForm ? 'Cancel' : 'Add custom drink'}
          </button>
          {showDrinkForm && (
            <div>
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Name"
              />
              <select
                value={newCategory}
                onChange={(event) =>
                  setNewCategory(
                    event.target.value as Tables<'drinks'>['category'],
                  )
                }
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {Constants.public.Enums.drink_categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newAbv}
                onChange={(event) => setNewAbv(event.target.value)}
                placeholder="ABV (%)"
              />
              <input
                type="number"
                min="0"
                max="1000"
                value={newCalories}
                onChange={(event) => setNewCalories(event.target.value)}
                placeholder="Calories per 100ml (optional)"
              />
              <button
                onClick={handleCreateDrink}
                disabled={pending || !newName || !newCategory || !newAbv}
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}

      <ul>
        {drinkLogs.map((log) => (
          <li key={log.id}>
            {drinkName(log.drink_id)}: {log.volume} ml
            <button
              onClick={() => handleRemoveDrink(log.id)}
              disabled={pending}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
