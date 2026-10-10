'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { IconPlus } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
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

export function CreateHangout({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleCreate() {
    setPending(true);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('hangouts')
      .insert({
        name: randomName(),
        creator_id: userId,
        timezone,
      })
      .select()
      .single();
    if (error) {
      setPending(false);
      toast.add({ type: 'error', title: error.message });
      return;
    }

    posthog.capture('hangout_created', { hangout_id: data.id });
    router.refresh();
    router.push(`/hangouts/${data.id}`);
  }

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={pending}
      aria-label="Create hangout"
      className="absolute right-4 bottom-6 flex size-14 items-center justify-center rounded-full bg-linear-to-b from-white to-[#cfcfcf] text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-3px_6px_rgba(0,0,0,0.15),0_10px_20px_-6px_rgba(0,0,0,0.65),0_3px_6px_-2px_rgba(0,0,0,0.45)] transition-[transform,box-shadow] duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.18),0_4px_10px_-4px_rgba(0,0,0,0.6)] disabled:opacity-70"
    >
      <IconPlus className="size-6" />
    </button>
  );
}
