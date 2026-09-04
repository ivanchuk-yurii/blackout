'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Leaderboard } from './leaderboard';
import { SpotHistory } from './spot-history';
import { StatsChart } from './stats-chart';

export function Hangout({
  hangoutId,
  userId,
  state,
  name,
  startedAt,
  endedAt,
  members,
  photos: initialPhotos,
  spots,
  lastSpot: initialLastSpot,
  profile,
  drinks: initialDrinks,
  hangoutDrinks: initialHangoutDrinks,
  leaderboard,
  token,
}: {
  hangoutId: string;
  userId: string;
  name: string;
  startedAt: string;
  endedAt: string | null;
  state: HangoutState;
  members: Tables<'users'>[];
  photos: Photo[];
  spots: Spot[];
  lastSpot: Spot | null;
  profile: Tables<'user_profiles'> | null;
  drinks: Tables<'drinks'>[];
  hangoutDrinks: FullHangoutDrink[];
  leaderboard: HangoutLeaderboardEntry[];
  token?: string;
}) {
  const router = useRouter();
  const [lastSpot, setLastSpot] = useState(initialLastSpot);
  const [spotOpen, setSpotOpen] = useState(false);
  const [here, setHere] = useState<Point | null>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [drinks, setDrinks] = useState(initialDrinks);
  const [drinkLogs, setDrinkLogs] = useState(initialHangoutDrinks);

  const isParticipant =
    state === HangoutState.Member || state === HangoutState.Creator;
  const isActive = !endedAt;

  async function saveName(name: string) {
    const supabase = createClient();
    return supabase.from('hangouts').update({ name }).eq('id', hangoutId);
  }

  async function logDrink(log: FullHangoutDrink) {
    setDrinkLogs((current) => [...current, log]);

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
          lastSpot={lastSpot}
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
        <Members hangoutId={hangoutId} members={members} />
        <Photos hangoutId={hangoutId} photos={photos} />
      </div>

      {isActive && isParticipant && (
        <Camera
          hangoutId={hangoutId}
          onAdd={(photo) => setPhotos((current) => [photo, ...current])}
        />
      )}

      {!!leaderboard.length && <Leaderboard entries={leaderboard} />}

      {!!spots.length && <SpotHistory spots={spots} />}

      {!!drinkLogs.length && (
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
          drinks={drinks}
          drinkLogs={drinkLogs}
          onAdd={logDrink}
          onCreate={(drink) => setDrinks((current) => [...current, drink])}
        />
      )}

      {!!drinkLogs.length && (
        <Drinks
          hangoutId={hangoutId}
          userId={userId}
          startedAt={startedAt}
          endedAt={endedAt}
          drinkLogs={drinkLogs}
          onAdd={logDrink}
          onUpdate={(updated) =>
            setDrinkLogs((current) =>
              current
                .map((log) => (log.id === updated.id ? updated : log))
                .sort((a, b) => a.created_at.localeCompare(b.created_at)),
            )
          }
          onRemove={(logId) =>
            setDrinkLogs((current) => current.filter((log) => log.id !== logId))
          }
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
          previous={lastSpot}
          current={here}
          onChange={(spot) => {
            setLastSpot(spot);
            setSpotOpen(false);
          }}
        />
      </Overlay>
    </main>
  );
}
