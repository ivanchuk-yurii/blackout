'use client';

import { useState } from 'react';
import { IconChevronRight, IconLocationFilled } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { type Point } from '@/lib/supabase/custom-types';
import { type Spot } from './select-spot';

export function SetSpot({
  isEditable,
  lastSpot,
  onOpen,
}: {
  isEditable: boolean;
  lastSpot: Spot | null;
  onOpen: (here: Point | null) => void;
}) {
  const [pending, setPending] = useState(false);

  function handleSetSpot() {
    if (!navigator.geolocation) {
      onOpen(null);
      return;
    }

    setPending(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPending(false);
        onOpen({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setPending(false);
        onOpen(null);
      },
    );
  }

  if (!isEditable) {
    if (!lastSpot) return null;

    return (
      <p className="flex min-w-0 items-center gap-1 py-0.5 pr-2 pl-0.5 text-sm font-medium text-muted-foreground">
        <IconLocationFilled className="size-4 shrink-0" />
        <span className="truncate">{lastSpot.name}</span>
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleSetSpot}
      disabled={pending}
      className="min-w-0 shrink rounded-lg py-0.5 pr-2 pl-0.5 font-medium text-muted-foreground"
    >
      <IconLocationFilled className="size-4" />
      <span className="truncate">
        {pending ? 'Locating…' : (lastSpot?.name ?? 'Set spot')}
      </span>
      <IconChevronRight className="size-4" />
    </Button>
  );
}
