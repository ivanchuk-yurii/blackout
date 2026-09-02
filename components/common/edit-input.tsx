'use client';

import { useState } from 'react';
import { IconPencil } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';

export function EditInput({
  value: initialValue,
  label,
  placeholder,
  autoComplete,
  onSave,
}: {
  value: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  onSave: (value: string) => Promise<{ error?: { message: string } | null }>;
}) {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = value.trim();
    setPending(true);

    const { error } = await onSave(trimmed);
    setPending(false);
    if (error) {
      toast.add({ type: 'error', title: error.message });
      return;
    }

    setValue(trimmed);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2 py-0.5">
        <span className="truncate text-lg/7 font-medium">{value || '—'}</span>
        <button
          type="button"
          aria-label={`Edit ${label.toLowerCase()}`}
          onClick={() => setEditing(true)}
          className="-m-2 shrink-0 rounded-full p-2 text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <IconPencil className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
      <Input
        autoFocus
        required
        aria-label={label}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-8 rounded-none border-0 border-b border-accent-foreground bg-background px-0.5 py-1 text-sm shadow-xs focus-visible:border-accent-foreground focus-visible:ring-0"
      />
      <Button
        type="submit"
        size="sm"
        className="rounded-xl px-4"
        disabled={!value.trim() || pending}
      >
        {pending ? 'Saving…' : 'Save'}
      </Button>
    </form>
  );
}
