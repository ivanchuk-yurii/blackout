'use client';

import { useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import {
  IconClockX,
  IconShare2,
  IconUser,
  IconUserPlus,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { HangoutState } from '@/app/hangouts/[id]/state';
import { type MemberListItem } from '@/app/hangouts/[id]/members/member-list';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/toast';
import { Share } from '@/components/common/share';
import { UserListItem } from '@/components/common/user-list-item';

export function DrinksEmpty({
  hangoutId,
  buddies: initialBuddies,
}: {
  hangoutId: string;
  buddies: MemberListItem[];
}) {
  const { data: buddies = [], mutate: mutateBuddies } = useSWR<
    MemberListItem[]
  >(`hangout/${hangoutId}/buddies`, null, { fallbackData: initialBuddies });
  const [pending, setPending] = useState<string | null>(null);

  async function shareHangout(token: string) {
    const supabase = createClient();
    return supabase.from('hangout_shares').insert({ id: hangoutId, token });
  }

  function setType(id: string, type: HangoutState) {
    const update = (items: MemberListItem[]) =>
      items.map((item) => (item.user.id === id ? { ...item, type } : item));

    void mutateBuddies((current = initialBuddies) => update(current));
    void globalMutate(
      `hangout/${hangoutId}/members/all`,
      (current?: MemberListItem[]) => (current ? update(current) : undefined),
    );
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

  return (
    <Empty className="my-6 flex-none rounded-4xl bg-card p-4">
      <EmptyHeader className="max-w-none">
        <EmptyMedia aria-hidden className="mb-0">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="-mr-2 flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed border-neutral-700 bg-muted text-muted-foreground ring-2 ring-card last:mr-0"
            >
              <IconUser className="size-4" />
            </div>
          ))}
        </EmptyMedia>

        <div className="flex flex-col gap-1">
          <EmptyTitle className="text-base/6 tracking-normal">
            Invite people to hangout
          </EmptyTitle>
          <EmptyDescription className="text-sm/5">
            Invite friends to track drinks with a QR code or by sending a link.
          </EmptyDescription>
        </div>
      </EmptyHeader>

      <EmptyContent className="max-w-none">
        <Share
          path={`/hangouts/${hangoutId}/join`}
          title="hangout"
          onShare={shareHangout}
        >
          {(trigger) => (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full shadow-xs"
              {...trigger}
            >
              <IconShare2 />
              Share link
            </Button>
          )}
        </Share>

        {buddies.length > 0 && (
          <>
            <div className="flex w-full items-center gap-4">
              <Separator className="flex-1" />
              <p className="text-sm/5 text-muted-foreground">
                Or add your buddies
              </p>
              <Separator className="flex-1" />
            </div>

            <ul className="max-h-72 w-full overflow-y-auto overscroll-contain text-left text-base">
              {buddies.map((item, index) => (
                <li key={item.user.id}>
                  {index > 0 && <Separator />}
                  <UserListItem {...item.user}>
                    {item.type === HangoutState.Invited ? (
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
                    ) : (
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
          </>
        )}
      </EmptyContent>
    </Empty>
  );
}
