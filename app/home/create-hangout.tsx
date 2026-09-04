'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconPlus, IconUserMinus, IconUserPlus } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { type Tables } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { UserListItem } from '@/components/common/user-list-item';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Field, FieldError } from '@/components/ui/field';
import { toast } from '@/components/ui/toast';

const HANGOUT_NAMES = [
  'One and done',
  'Heavy one',
  'Quick pub crawl',
  'Just one drink',
  'BIG night out',
  'Small gathering',
  'Sunday session',
  'After work pints',
  'Rooftop rounds',
  'Last minute round',
  'Bottomless brunch',
  'Cocktail experiment',
  'Wine and whine',
  'Beer garden run',
  'Karaoke damage',
  'Dive bar tour',
  'Terrace tequila',
  'Payday celebration',
  'Slow burner',
  'Work tomorrow',
  'Emergency pint',
  'Late one',
  'Round the corner',
  'Whisky business',
  'Two drink max',
  'Rooftop sunset',
  'Neighbourhood loop',
  'Kitchen party',
  'Cheap and cheerful',
  'Long overdue catch up',
  'Midweek mischief',
  'Friday reset',
  'Nightcap only',
  'Tab we regret',
  'Birthday chaos',
  'Beers and boardgames',
  'Balcony beers',
  'Third round rule',
  'Happy hour hunt',
  'Pre-drinks only',
  'Full send',
  'Gentle one',
  'Recovery drinks',
  'Last orders',
  'Spontaneous session',
  'Sunset sippers',
  'Taproom tour',
  'Shots not sure',
  'Something light',
  'Absolute blackout',
];

function randomName() {
  return HANGOUT_NAMES[Math.floor(Math.random() * HANGOUT_NAMES.length)];
}

export function CreateHangout({
  userId,
  buddies,
}: {
  userId: string;
  buddies: Tables<'users'>[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [placeholder, setPlaceholder] = useState(HANGOUT_NAMES[0]);
  const [invited, setInvited] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setPlaceholder(randomName());
    } else {
      setName('');
      setInvited([]);
      setError(null);
    }
  }

  function toggleInvite(id: string) {
    setInvited((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function handleCreate() {
    setPending(true);
    setError(null);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const supabase = createClient();
    const { data, error: createError } = await supabase
      .from('hangouts')
      .insert({
        name: name.trim() || placeholder,
        creator_id: userId,
        timezone,
      })
      .select()
      .single();
    if (createError) {
      setPending(false);
      setError(createError.message);
      return;
    }

    if (invited.length) {
      const { error } = await supabase.from('hangout_invites').insert(
        invited.map((id) => ({
          hangout_id: data.id,
          user_id: id,
        })),
      );
      if (error) {
        toast.add({ type: 'error', title: error.message });
      }
    }

    router.refresh();
    router.push(`/hangouts/${data.id}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        aria-label="Create hangout"
        className="absolute right-4 bottom-6 flex size-14 items-center justify-center rounded-full bg-linear-to-b from-white to-[#cfcfcf] text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-3px_6px_rgba(0,0,0,0.15),0_10px_20px_-6px_rgba(0,0,0,0.65),0_3px_6px_-2px_rgba(0,0,0,0.45)] transition-[transform,box-shadow] duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.18),0_4px_10px_-4px_rgba(0,0,0,0.6)]"
      >
        <IconPlus className="size-6" />
      </button>

      <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>New hangout</DrawerTitle>
          </DrawerHeader>

          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              handleCreate();
            }}
          >
            <Field className="shrink-0 p-4">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={placeholder}
                aria-label="Hangout name"
                autoComplete="off"
                disabled={pending}
              />

              <FieldError>{error}</FieldError>
            </Field>

            {buddies.length > 0 && (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
                <p className="text-sm text-muted-foreground">Invite buddies</p>

                <ul>
                  {buddies.map((buddy, index) => (
                    <li key={buddy.id}>
                      {index > 0 && <Separator />}
                      <UserListItem {...buddy}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-lg"
                          aria-pressed={invited.includes(buddy.id)}
                          aria-label={
                            invited.includes(buddy.id)
                              ? `Don't invite ${buddy.name}`
                              : `Invite ${buddy.name}`
                          }
                          disabled={pending}
                          onClick={() => toggleInvite(buddy.id)}
                        >
                          {invited.includes(buddy.id) ? (
                            <IconUserMinus />
                          ) : (
                            <IconUserPlus />
                          )}
                        </Button>
                      </UserListItem>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DrawerFooter>
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? 'Creating…' : 'Create'}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
}
