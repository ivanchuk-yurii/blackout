'use client';

import { useState } from 'react';
import {
  IconCheck,
  IconClockX,
  IconCrown,
  IconUserMinus,
  IconUserPlus,
  IconX,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { type Tables } from '@/lib/supabase/types';
import { HangoutState } from '@/app/hangouts/[id]/state';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/toast';
import { UserListItem } from '@/components/common/user-list-item';

export type MemberListItem = {
  type: HangoutState;
  user: Tables<'users'>;
};

export function MemberList({
  hangoutId,
  isActive,
  items: initialItems,
}: {
  hangoutId: string;
  isActive: boolean;
  items: MemberListItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [pending, setPending] = useState<string | null>(null);

  function setType(id: string, type: HangoutState) {
    setItems((current) =>
      current.map((item) => (item.user.id === id ? { ...item, type } : item)),
    );
  }

  async function handleAccept(id: string) {
    setPending(id);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangout_members')
      .insert({ hangout_id: hangoutId, user_id: id });

    setPending(null);
    if (error) {
      toast.add({ type: 'error', title: error.message });
      return;
    }

    setType(id, HangoutState.Member);
  }

  async function handleDeny(id: string) {
    setPending(id);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangout_requests')
      .delete()
      .eq('hangout_id', hangoutId)
      .eq('user_id', id);

    setPending(null);
    if (error) {
      toast.add({ type: 'error', title: error.message });
      return;
    }

    setType(id, HangoutState.Initial);
  }

  async function handleCancelInvite(id: string) {
    setPending(id);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangout_invites')
      .delete()
      .eq('hangout_id', hangoutId)
      .eq('user_id', id);

    setPending(null);
    if (error) {
      toast.add({ type: 'error', title: error.message });
      return;
    }

    setType(id, HangoutState.Initial);
  }

  async function handleRemove(id: string) {
    setPending(id);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangout_members')
      .delete()
      .eq('hangout_id', hangoutId)
      .eq('user_id', id);

    setPending(null);
    if (error) {
      toast.add({ type: 'error', title: error.message });
      return;
    }

    setType(id, HangoutState.Initial);
  }

  async function handleInvite(id: string) {
    setPending(id);

    const supabase = createClient();
    const { error } = await supabase
      .from('hangout_invites')
      .insert({ hangout_id: hangoutId, user_id: id });

    setPending(null);
    if (error) {
      toast.add({ type: 'error', title: error.message });
      return;
    }

    setType(id, HangoutState.Invited);
  }

  return (
    <ul className="mt-4 px-4">
      {items.map((item, index) => (
        <li key={item.user.id}>
          {index > 0 && <Separator />}
          <UserListItem {...item.user}>
            {item.type === HangoutState.Creator && (
              <span className="flex size-10 shrink-0 items-center justify-center text-muted-foreground">
                <IconCrown className="size-4" aria-hidden />
                <span className="sr-only">Creator</span>
              </span>
            )}

            {isActive && item.type === HangoutState.Requested && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label={`Accept ${item.user.name}`}
                  disabled={pending === item.user.id}
                  onClick={() => handleAccept(item.user.id)}
                >
                  <IconCheck />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label={`Deny ${item.user.name}`}
                  disabled={pending === item.user.id}
                  onClick={() => handleDeny(item.user.id)}
                >
                  <IconX />
                </Button>
              </>
            )}

            {isActive && item.type === HangoutState.Invited && (
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label={`Cancel invite for ${item.user.name}`}
                disabled={pending === item.user.id}
                onClick={() => handleCancelInvite(item.user.id)}
              >
                <IconClockX />
              </Button>
            )}

            {isActive && item.type === HangoutState.Member && (
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label={`Remove ${item.user.name}`}
                disabled={pending === item.user.id}
                onClick={() => handleRemove(item.user.id)}
              >
                <IconUserMinus />
              </Button>
            )}

            {isActive && item.type === HangoutState.Initial && (
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                aria-label={`Invite ${item.user.name}`}
                disabled={pending === item.user.id}
                onClick={() => handleInvite(item.user.id)}
              >
                <IconUserPlus />
              </Button>
            )}
          </UserListItem>
        </li>
      ))}
    </ul>
  );
}
