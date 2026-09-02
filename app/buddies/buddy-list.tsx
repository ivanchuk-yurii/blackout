'use client';

import { useState } from 'react';
import {
  IconCheck,
  IconClockX,
  IconMoodCrazyHappy,
  IconUserMinus,
  IconX,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/lib/supabase/types';
import { BuddyState } from '@/app/buddies/[id]/state';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { UserListItem } from '@/components/common/user-list-item';

export type BuddyListItem = {
  type: BuddyState;
  user: Tables<'users'>;
};

export function BuddyList({
  userId,
  initialItems,
}: {
  userId: string;
  initialItems: BuddyListItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [pending, setPending] = useState<string | null>(null);

  function drop(id: string) {
    setItems((current) => current.filter((item) => item.user.id !== id));
  }

  async function handleRemove(id: string) {
    setPending(id);

    const supabase = createClient();
    await supabase
      .from('buddies')
      .delete()
      .or(`buddy_id.eq.${id},user_id.eq.${id}`);

    setPending(null);
    drop(id);
  }

  async function handleCancel(id: string) {
    setPending(id);

    const supabase = createClient();
    await supabase.from('buddy_requests').delete().eq('buddy_id', id);

    setPending(null);
    drop(id);
  }

  async function handleDeny(id: string) {
    setPending(id);

    const supabase = createClient();
    await supabase.from('buddy_requests').delete().eq('user_id', id);

    setPending(null);
    drop(id);
  }

  async function handleAccept(id: string) {
    setPending(id);

    const supabase = createClient();
    await supabase.from('buddies').insert({ user_id: id, buddy_id: userId });

    setPending(null);
    setItems((current) =>
      current.map((item) =>
        item.user.id === id ? { ...item, type: BuddyState.Buddies } : item,
      ),
    );
  }

  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconMoodCrazyHappy />
          </EmptyMedia>
          <EmptyTitle>No buddies</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            Share your profile to add buddies and start hanging out together.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="mt-4 px-4">
      {items.map((item, index) => (
        <li key={item.user.id}>
          {index > 0 && <Separator />}
          <UserListItem {...item.user}>
            {item.type === BuddyState.Buddies && (
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label="Remove buddy"
                disabled={pending === item.user.id}
                onClick={() => handleRemove(item.user.id)}
              >
                <IconUserMinus />
              </Button>
            )}

            {item.type === BuddyState.Requested && (
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label="Cancel request"
                disabled={pending === item.user.id}
                onClick={() => handleCancel(item.user.id)}
              >
                <IconClockX />
              </Button>
            )}

            {item.type === BuddyState.Invited && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Approve request"
                  disabled={pending === item.user.id}
                  onClick={() => handleAccept(item.user.id)}
                >
                  <IconCheck />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Deny request"
                  disabled={pending === item.user.id}
                  onClick={() => handleDeny(item.user.id)}
                >
                  <IconX />
                </Button>
              </>
            )}
          </UserListItem>
        </li>
      ))}
    </ul>
  );
}
