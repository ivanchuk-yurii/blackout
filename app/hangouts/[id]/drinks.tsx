'use client';

import { useState } from 'react';
import { IconPencil, IconRepeat, IconTrash } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import {
  DRINK_CATEGORY_EMOJIS,
  type FullHangoutDrink,
} from '@/lib/supabase/custom-types';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VolumeSlider, VOLUME_RANGES } from '@/components/common/volume-slider';

const TIME = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
});

function toTimeValue(iso: string) {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function withTimeValue(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  if (date > new Date()) date.setDate(date.getDate() - 1);
  return date.toISOString();
}

export function Drinks({
  hangoutId,
  userId,
  startedAt,
  endedAt,
  drinkLogs,
  onAdd,
  onRemove,
  onUpdate,
}: {
  hangoutId: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  drinkLogs: FullHangoutDrink[];
  onAdd: (log: FullHangoutDrink) => void;
  onRemove: (logId: string) => void;
  onUpdate: (log: FullHangoutDrink) => void;
}) {
  const [editing, setEditing] = useState<FullHangoutDrink | null>(null);
  const [volume, setVolume] = useState(0);
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  function openEditDrink(log: FullHangoutDrink) {
    setError(null);
    setVolume(log.volume);
    setTime(toTimeValue(log.created_at));
    setEditing(log);
  }

  async function handleRepeatDrink(log: FullHangoutDrink) {
    setPending(log.id);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('hangout_drinks')
      .insert({
        hangout_id: hangoutId,
        user_id: userId,
        drink_id: log.drink_id,
        volume: log.volume,
      })
      .select('*, drink:drinks(*)')
      .single();
    setPending(null);
    if (error) {
      toast.add({ type: 'error', title: error.message });
      return;
    }
    onAdd(data);
  }

  async function handleRemoveDrink(logId: string) {
    setPending(logId);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangout_drinks')
      .delete()
      .eq('id', logId);
    setPending(null);
    if (error) {
      toast.add({ type: 'error', title: error.message });
      return;
    }
    onRemove(logId);
  }

  async function handleEditDrink() {
    if (!editing || !time) return;

    const createdAt = withTimeValue(time);

    if (new Date(createdAt) < new Date(startedAt)) {
      setError(
        `Should be after ${TIME.format(new Date(startedAt))} hangout start.`,
      );
      return;
    }

    setPending(editing.id);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('hangout_drinks')
      .update({ volume, created_at: createdAt })
      .eq('id', editing.id)
      .select('*, drink:drinks(*)')
      .single();
    setPending(null);
    if (error) {
      setError(error.message);
      return;
    }
    onUpdate(data);
    setEditing(null);
  }

  return (
    <>
      <ul className="-mx-2 py-2 pr-8">
        {drinkLogs.map((log) => (
          <li key={log.id}>
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={!!endedAt || pending !== null}
                aria-label={`Actions for ${log.drink.name}`}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left outline-none hover:bg-accent focus-visible:bg-accent data-popup-open:bg-accent"
              >
                <span aria-hidden className="shrink-0 text-xl/none">
                  {DRINK_CATEGORY_EMOJIS[log.drink.category]}
                </span>

                <span className="min-w-0 truncate text-sm font-medium">
                  {log.drink.name}
                </span>

                <span className="shrink-0 flex-1 text-xs text-muted-foreground tabular-nums">
                  {log.volume} ml
                </span>

                <time
                  dateTime={log.created_at}
                  className="shrink-0 text-xs text-muted-foreground tabular-nums"
                >
                  {TIME.format(new Date(log.created_at))}
                </time>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => handleRepeatDrink(log)}>
                  <IconRepeat />
                  Repeat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditDrink(log)}>
                  <IconPencil />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleRemoveDrink(log.id)}
                >
                  <IconTrash />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>

      <Drawer
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        showSwipeHandle
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit drink</DrawerTitle>
          </DrawerHeader>

          {editing && (
            <>
              <div className="flex items-center gap-3 px-4 pt-4">
                <span aria-hidden className="shrink-0 text-2xl/none">
                  {DRINK_CATEGORY_EMOJIS[editing.drink.category]}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {editing.drink.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="capitalize">{editing.drink.category}</span>{' '}
                    · {editing.drink.abv}% ABV
                  </p>
                </div>
              </div>

              <div className="px-4 pt-4">
                <Field>
                  <FieldLabel htmlFor="drink-time">Time</FieldLabel>
                  <Input
                    id="drink-time"
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    disabled={pending !== null}
                    className="appearance-none [&::-webkit-date-and-time-value]:mx-0 [&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-date-and-time-value]:text-left"
                  />
                </Field>
              </div>

              <DrawerFooter
                data-base-ui-swipe-ignore
                className="gap-0 pt-4 pb-6"
              >
                <VolumeSlider
                  category={editing.drink.category}
                  value={volume}
                  onValueChange={setVolume}
                  min={VOLUME_RANGES[editing.drink.category].min}
                  max={VOLUME_RANGES[editing.drink.category].max}
                  disabled={pending !== null}
                />

                <FieldError>{error}</FieldError>

                <Button
                  size="lg"
                  className="mt-2"
                  onClick={handleEditDrink}
                  disabled={pending !== null || !time}
                >
                  Save
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
