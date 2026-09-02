'use client';

import { useState } from 'react';
import { IconChevronDown, IconMoodSmile, IconX } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';

const STATUSES = [
  '☕ Taking it easy',
  '🚫 Dry tonight',
  '🏠 Drinking at home',
  '🫠 Regretting last night',
  '💧 Hydrating',
  '🏃 Earned my drinks',
  '🧘 Taking a week off',
  '😴 Hungover',
  '🏆 Chasing the leaderboard',
];

export function StatusPicker({
  userId,
  status: initialStatus,
}: {
  userId: string;
  status: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, setPending] = useState(false);

  async function save(next: string | null) {
    const previous = status;

    setStatus(next);
    setPending(true);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('users')
      .update({ status: next })
      .eq('id', userId);

    setPending(false);
    if (updateError) {
      setStatus(previous);
      toast.add({ type: 'error', title: updateError.message });
    }
  }

  return (
    <Select value={status} onValueChange={save}>
      {status ? (
        <div className="flex w-fit items-center gap-1 rounded-lg bg-card pr-0.5">
          <SelectTrigger
            size="sm"
            icon={null}
            aria-label="Change status"
            className="justify-start rounded-lg border-transparent bg-transparent py-0 pr-0 pl-2 hover:bg-transparent"
          >
            <span className="truncate text-sm/5">{status}</span>
          </SelectTrigger>
          <button
            type="button"
            aria-label="Remove status"
            onClick={() => save(null)}
            disabled={pending}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
          >
            <IconX className="size-4" />
          </button>
        </div>
      ) : (
        <SelectTrigger
          size="sm"
          icon={<IconChevronDown className="size-4 shrink-0" />}
          className="justify-start gap-1 rounded-lg border-transparent bg-transparent py-0.5 pr-2 pl-0.5 text-sm/5 font-medium text-muted-foreground hover:bg-muted"
        >
          <span className="flex size-7 shrink-0 items-center justify-center">
            <IconMoodSmile className="size-5" />
          </span>
          Set status
        </SelectTrigger>
      )}

      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="w-auto"
      >
        {STATUSES.map((value) => (
          <SelectItem key={value} value={value} className="gap-2 py-1.5 pl-2">
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
