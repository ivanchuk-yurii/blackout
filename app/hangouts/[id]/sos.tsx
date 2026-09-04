'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FieldError } from '@/components/ui/field';

const SOS_INTERVAL = 5_000;

export function Sos({
  hangoutId,
  userId,
  inSos: initialInSos,
}: {
  hangoutId: string;
  userId: string;
  inSos: boolean;
}) {
  const [inSos, setInSos] = useState(initialInSos);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const watchRef = useRef<number | null>(null);
  const updatedAtRef = useRef(0);

  useEffect(() => {
    if (!inSos) return;

    watchRef.current = navigator.geolocation?.watchPosition(
      (position) => {
        if (position.timestamp - updatedAtRef.current < SOS_INTERVAL) return;

        const supabase = createClient();
        void supabase
          .from('sos_alerts')
          .update({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            updated_at: new Date(position.timestamp).toISOString(),
          })
          .eq('hangout_id', hangoutId)
          .eq('user_id', userId)
          .then();
      },
      null,
      { enableHighAccuracy: true },
    );

    return () => {
      if (watchRef.current === null) return;
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    };
  }, [hangoutId, userId, inSos]);

  async function handleSos() {
    setPending(true);
    setError(null);

    const position: GeolocationPosition | null = await new Promise(
      (resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(position);
          },
          () => {
            resolve(null);
          },
          { enableHighAccuracy: true },
        );
      },
    );
    const timestamp = position?.timestamp ?? Date.now();

    const supabase = createClient();
    const { error } = await supabase.from('sos_alerts').insert({
      hangout_id: hangoutId,
      user_id: userId,
      lat: position?.coords.latitude ?? null,
      lon: position?.coords.longitude ?? null,
      updated_at: new Date(timestamp).toISOString(),
    });

    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    updatedAtRef.current = timestamp;
    setInSos(true);
  }

  async function handleCancelSos() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('sos_alerts')
      .delete()
      .eq('hangout_id', hangoutId)
      .eq('user_id', userId);
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    updatedAtRef.current = 0;
    setInSos(false);
  }

  return (
    <>
      <FieldError>{error}</FieldError>

      {inSos ? (
        <button onClick={handleCancelSos} disabled={pending}>
          Cancel SOS
        </button>
      ) : (
        <button onClick={handleSos} disabled={pending}>
          SOS
        </button>
      )}
    </>
  );
}
