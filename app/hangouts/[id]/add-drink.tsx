'use client';

import { useState } from 'react';
import {
  IconCheck,
  IconGlass,
  IconGlassFull,
  IconGlassOff,
  IconPlus,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { Constants, type Enums, type Tables } from '@/lib/supabase/types';
import {
  DRINK_CATEGORY_EMOJIS,
  type FullHangoutDrink,
} from '@/lib/supabase/custom-types';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VolumeSlider, VOLUME_RANGES } from '@/components/common/volume-slider';
import { FieldError } from '@/components/ui/field';

export function AddDrink({
  hangoutId,
  userId,
  drinks,
  drinkLogs,
  onAdd,
  onCreate,
}: {
  hangoutId: string;
  userId: string;
  drinks: Tables<'drinks'>[];
  drinkLogs: FullHangoutDrink[];
  onAdd: (log: FullHangoutDrink) => void;
  onCreate: (drink: Tables<'drinks'>) => void;
}) {
  const [showDrinkList, setShowDrinkList] = useState(false);
  const [search, setSearch] = useState('');
  const [pouringDrink, setPouringDrink] = useState<Tables<'drinks'> | null>(
    null,
  );
  const [volume, setVolume] = useState(VOLUME_RANGES.cocktail.default);
  const [showDrinkForm, setShowDrinkForm] = useState(false);
  const [newCategory, setNewCategory] =
    useState<Enums<'drink_categories'>>('beer');
  const [newAbv, setNewAbv] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const query = search.trim().toLowerCase();
  const matches = query
    ? drinks.filter(
        (drink) =>
          drink.name.toLowerCase().includes(query) ||
          drink.category.includes(query),
      )
    : drinks;
  const category = pouringDrink?.category ?? newCategory;

  function handleSelectDrink(drink: Tables<'drinks'>) {
    if (drink.volume != null) {
      handleAddDrink(drink, drink.volume);
      return;
    }
    setVolume(VOLUME_RANGES[drink.category].default);
    setPouringDrink(drink);
  }

  function openDrinkForm() {
    setPouringDrink(null);
    handleChangeCategory('beer');
    setShowDrinkForm(true);
  }

  function handleChangeCategory(category: Enums<'drink_categories'>) {
    setNewCategory(category);
    setVolume(VOLUME_RANGES[category].default);
  }

  function closeDrawer() {
    setShowDrinkList(false);
    setSearch('');
    setPouringDrink(null);
    setShowDrinkForm(false);
    setNewAbv('');
  }

  async function handleAddDrink(drink: Tables<'drinks'>, ml: number) {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('hangout_drinks')
      .insert({
        hangout_id: hangoutId,
        user_id: userId,
        drink_id: drink.id,
        volume: ml,
      })
      .select('*, drink:drinks(*)')
      .single();
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    onAdd(data);
    closeDrawer();
  }

  async function handleCreateDrink() {
    const name = search.trim();
    if (!name || !newAbv) return;

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('drinks')
      .insert({
        name,
        category: newCategory,
        abv: Number(newAbv),
        user_id: userId,
      })
      .select()
      .single();
    if (error) {
      setPending(false);
      setError(error.message);
      return;
    }
    onCreate(data);
    await handleAddDrink(data, volume);
  }

  return (
    <>
      {drinkLogs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconGlass />
            </EmptyMedia>
            <EmptyTitle>No drinks yet</EmptyTitle>
            <EmptyDescription className="max-w-xs text-pretty">
              Log what you drink to keep track of the night.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="lg" onClick={() => setShowDrinkList(true)}>
              <IconGlassFull data-icon="inline-start" />
              Add drink
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <Button
          size="lg"
          className="w-full"
          onClick={() => setShowDrinkList(true)}
        >
          <IconGlassFull data-icon="inline-start" />
          Add drink
        </Button>
      )}

      <Drawer
        open={showDrinkList}
        onOpenChange={(open) => (open ? setShowDrinkList(true) : closeDrawer())}
        showSwipeHandle
      >
        <DrawerContent
          className={showDrinkForm ? undefined : '[--drawer-height:80dvh]'}
        >
          <DrawerHeader>
            <DrawerTitle>{showDrinkForm ? 'New drink' : 'Drinks'}</DrawerTitle>
          </DrawerHeader>

          <div className="shrink-0 p-4">
            <Input
              type={showDrinkForm ? 'text' : 'search'}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={showDrinkForm ? 'Name' : 'Search drinks…'}
              aria-label={showDrinkForm ? 'Drink name' : 'Search drinks'}
              autoComplete="off"
            />
          </div>

          {showDrinkForm ? (
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
              <Select
                value={newCategory}
                onValueChange={(next) =>
                  handleChangeCategory(next as Enums<'drink_categories'>)
                }
                disabled={pending}
              >
                <SelectTrigger className="w-full" aria-label="Category">
                  <SelectValue>
                    {(value: Enums<'drink_categories'>) => (
                      <>
                        <span aria-hidden>{DRINK_CATEGORY_EMOJIS[value]}</span>
                        <span className="capitalize">{value}</span>
                      </>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.drink_categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <span aria-hidden>{DRINK_CATEGORY_EMOJIS[category]}</span>
                      <span className="capitalize">{category}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.1"
                value={newAbv}
                onChange={(event) => setNewAbv(event.target.value)}
                placeholder="ABV (%)"
                aria-label="ABV percentage"
                disabled={pending}
              />
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
              {matches.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <IconGlassOff />
                    </EmptyMedia>
                    <EmptyTitle>No drinks</EmptyTitle>
                    <EmptyDescription className="max-w-xs text-pretty">
                      Nothing matches that name. Add it as your own drink
                      instead.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      variant="outline"
                      onClick={openDrinkForm}
                      disabled={pending}
                    >
                      <IconPlus data-icon="inline-start" />
                      Add custom drink
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <>
                  <ul>
                    {matches.map((drink) => (
                      <li key={drink.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectDrink(drink)}
                          disabled={pending}
                          aria-current={
                            drink.id === pouringDrink?.id || undefined
                          }
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none hover:bg-accent focus-visible:bg-accent disabled:opacity-50 aria-[current]:bg-accent aria-[current]:text-accent-foreground"
                        >
                          <span aria-hidden className="shrink-0 text-xl/none">
                            {DRINK_CATEGORY_EMOJIS[drink.category]}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {drink.name}
                          </span>
                          {drink.volume != null && (
                            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                              {drink.volume} ml
                            </span>
                          )}
                          {drink.id === pouringDrink?.id && (
                            <IconCheck className="size-4 shrink-0" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="outline"
                    className="mt-2 w-full justify-start rounded-xl px-3"
                    onClick={openDrinkForm}
                    disabled={pending}
                  >
                    <IconPlus data-icon="inline-start" />
                    Add custom drink
                  </Button>
                </>
              )}
            </div>
          )}

          <FieldError className="shrink-0 px-4 pb-2 wrap-anywhere">
            {error}
          </FieldError>

          {(pouringDrink || showDrinkForm) && (
            <DrawerFooter
              data-base-ui-swipe-ignore
              className="gap-0 border-t border-border pt-4"
            >
              <VolumeSlider
                category={category}
                value={volume}
                onValueChange={setVolume}
                disabled={pending}
              />

              <Button
                size="lg"
                className="mt-2"
                onClick={() =>
                  pouringDrink
                    ? handleAddDrink(pouringDrink, volume)
                    : handleCreateDrink()
                }
                disabled={
                  pending || (showDrinkForm && (!search.trim() || !newAbv))
                }
              >
                Add
              </Button>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
