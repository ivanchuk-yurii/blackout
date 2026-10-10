'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate as globalMutate } from 'swr';
import { IconChevronLeft } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { type Tables } from '@/lib/supabase/types';
import { HangoutState } from '@/app/hangouts/[id]/state';
import { distanceBetween } from '@/lib/google-maps/utils';
import { Button } from '@/components/ui/button';
import { EditInput } from '@/components/common/edit-input';
import {
  type FullHangoutDrink,
  type HangoutLeaderboardEntry,
  type Photo,
  type Point,
} from '@/lib/supabase/custom-types';
import { Members } from './members';
import { Camera } from './camera';
import { Photos } from './photos';
import { Overlay } from '@/components/common/overlay';
import { Action } from './action';
import { SetSpot } from './set-spot';
import { SelectSpot, type Spot } from './select-spot';
import { AddDrink } from './add-drink';
import { Drinks } from './drinks';
import { DrinksEmpty } from './drinks-empty';
import { type MemberListItem } from './members/member-list';
import { Leaderboard } from './leaderboard';
import { TruthOrLie, type LastGame } from './truth-or-lie';
import { SpotHistory } from './spot-history';
import { StatsChart } from './stats-chart';

export function Hangout({
  hangoutId,
  userId,
  state,
  name,
  startedAt,
  endedAt,
  members: initialMembers,
  photos: initialPhotos,
  spots,
  lastSpot: initialLastSpot,
  profile,
  drinks: initialDrinks,
  hangoutDrinks: initialHangoutDrinks,
  leaderboard,
  lastGame,
  token,
  buddies,
}: {
  hangoutId: string;
  userId: string;
  name: string;
  startedAt: string;
  endedAt: string | null;
  state: HangoutState;
  members: Tables<'users'>[];
  buddies: MemberListItem[];
  photos: Photo[];
  spots: Spot[];
  lastSpot: Spot | null;
  profile: Tables<'user_profiles'> | null;
  drinks: Tables<'drinks'>[];
  hangoutDrinks: FullHangoutDrink[];
  leaderboard: HangoutLeaderboardEntry[];
  lastGame: LastGame | null;
  token?: string;
}) {
  const router = useRouter();
  const [spotOpen, setSpotOpen] = useState(false);
  const [here, setHere] = useState<Point | null>(null);
  const { data: lastSpot, mutate: mutateLastSpot } = useSWR<Spot | null>(
    `hangout/${hangoutId}/spot`,
    null,
    { fallbackData: initialLastSpot },
  );
  const { data: members } = useSWR<Tables<'users'>[]>(
    `hangout/${hangoutId}/members/recent`,
    null,
    { fallbackData: initialMembers },
  );
  const { data: photos, mutate: mutatePhotos } = useSWR<Photo[]>(
    `hangout/${hangoutId}/photos/recent`,
    null,
    { fallbackData: initialPhotos },
  );
  const { data: drinks, mutate: mutateDrinks } = useSWR<Tables<'drinks'>[]>(
    `drinks/${userId}`,
    null,
    { fallbackData: initialDrinks },
  );
  const { data: drinkLogs, mutate: mutateDrinkLogs } = useSWR<
    FullHangoutDrink[]
  >(`hangout/${hangoutId}/drinks/${userId}`, null, {
    fallbackData: initialHangoutDrinks,
  });

  const isParticipant =
    state === HangoutState.Member || state === HangoutState.Creator;
  const isActive = !endedAt;

  async function saveName(name: string) {
    const supabase = createClient();
    return supabase.from('hangouts').update({ name }).eq('id', hangoutId);
  }

  function addPhoto(photo: Photo) {
    void mutatePhotos((current = initialPhotos) => [photo, ...current]);

    void globalMutate(`hangout/${hangoutId}/photos/all`, (current?: Photo[]) =>
      current ? [photo, ...current] : undefined,
    );
  }

  function createDrink(drink: Tables<'drinks'>) {
    void mutateDrinks((current = initialDrinks) => [...current, drink]);
  }

  function updateDrinkLog(updated: FullHangoutDrink) {
    void mutateDrinkLogs((current = initialHangoutDrinks) =>
      current
        .map((log) => (log.id === updated.id ? updated : log))
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    );
  }

  function removeDrinkLog(logId: string) {
    void mutateDrinkLogs((current = initialHangoutDrinks) =>
      current.filter((log) => log.id !== logId),
    );
  }

  async function logDrink(log: FullHangoutDrink) {
    void mutateDrinkLogs((current = initialHangoutDrinks) => [...current, log]);

    if (state !== HangoutState.Creator) return;

    if (!navigator.geolocation) {
      if (!lastSpot) {
        setHere(null);
        setSpotOpen(true);
      }

      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const point = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };

      if (
        lastSpot &&
        lastSpot.lat != null &&
        lastSpot.lon != null &&
        distanceBetween(
          { latitude: lastSpot.lat, longitude: lastSpot.lon },
          { latitude: point.lat, longitude: point.lon },
        ) <
          100 + position.coords.accuracy
      ) {
        return;
      }

      setHere(point);
      setSpotOpen(true);
    });
  }

  useEffect(() => {
    document.documentElement.classList.add('scrollbar-none');
    return () => document.documentElement.classList.remove('scrollbar-none');
  }, []);

  useEffect(() => {
    if (state === HangoutState.Creator) return;

    const supabase = createClient();
    const channel = supabase.channel(`hangouts:${hangoutId}`).on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'hangouts',
        filter: `id=eq.${hangoutId}`,
      },
      (payload) => {
        const previous = payload.old as Tables<'hangouts'>;
        const hangout = payload.new as Tables<'hangouts'>;

        if (hangout.ended_at !== previous.ended_at) {
          router.refresh();
        }
      },
    );

    void supabase.realtime.setAuth().then(() => channel.subscribe());

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [hangoutId, state]);

  return (
    <main className="flex flex-1 flex-col px-3">
      <header className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="Go back"
          onClick={() => router.back()}
        >
          <IconChevronLeft className="size-5" />
        </Button>

        <SetSpot
          isEditable={isActive && state === HangoutState.Creator}
          lastSpot={lastSpot ?? null}
          onOpen={(point) => {
            setHere(point);
            setSpotOpen(true);
          }}
        />
      </header>

      <div className="py-2">
        {state === HangoutState.Creator ? (
          <EditInput
            label="Hangout name"
            placeholder="Name this hangout"
            value={name}
            size="lg"
            onSave={saveName}
          />
        ) : (
          <h1 className="truncate py-0.5 text-2xl/8 font-medium">{name}</h1>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <Members
          hangoutId={hangoutId}
          userId={userId}
          members={members ?? []}
        />
        <Photos hangoutId={hangoutId} photos={photos ?? []} />
      </div>

      {isActive && isParticipant && (
        <Camera hangoutId={hangoutId} onAdd={addPhoto} />
      )}

      {false && isParticipant && (
        <TruthOrLie
          hangoutId={hangoutId}
          userId={userId}
          isCreator={state === HangoutState.Creator}
          isActive={isActive}
          game={lastGame}
        />
      )}

      {!!leaderboard.length && <Leaderboard entries={leaderboard} />}

      {!!spots.length && <SpotHistory spots={spots} />}

      {false && !!drinkLogs?.length && (
        <StatsChart
          hangoutDrinks={drinkLogs}
          profile={profile}
          endedAt={endedAt}
        />
      )}

      {isActive && isParticipant && (
        <AddDrink
          hangoutId={hangoutId}
          userId={userId}
          drinks={drinks ?? []}
          onAdd={logDrink}
          onCreate={createDrink}
        />
      )}

      {isActive && isParticipant && !drinkLogs?.length && (
        <DrinksEmpty hangoutId={hangoutId} buddies={buddies} />
      )}

      {!!drinkLogs?.length && (
        <Drinks
          hangoutId={hangoutId}
          userId={userId}
          startedAt={startedAt}
          endedAt={endedAt}
          drinkLogs={drinkLogs}
          onAdd={logDrink}
          onUpdate={updateDrinkLog}
          onRemove={removeDrinkLog}
        />
      )}

      <Action
        hangoutId={hangoutId}
        userId={userId}
        userState={state}
        isActive={isActive}
        token={token}
      />

      <Overlay open={spotOpen} onOpenChange={setSpotOpen}>
        <SelectSpot
          hangoutId={hangoutId}
          previous={lastSpot ?? null}
          current={here}
          onChange={(spot) => {
            void mutateLastSpot(spot);
            setSpotOpen(false);
          }}
        />
      </Overlay>
    </main>
  );
}
