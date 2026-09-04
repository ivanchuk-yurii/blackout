'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IconCameraFilled } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase/client';
import { type Photo } from '@/lib/supabase/custom-types';
import { toast } from '@/components/ui/toast';
import { Overlay, OverlayClose } from '@/components/common/overlay';

const COUNTDOWN = 3;

export function Camera({
  hangoutId,
  onAdd,
}: {
  hangoutId: string;
  onAdd: (photo: Photo) => void;
}) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(COUNTDOWN);
  const [shot, setShot] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function openCamera() {
    setReady(false);
    setCount(COUNTDOWN);
    setShot(null);
    setOpen(true);
  }

  function closeCamera() {
    if (shot) URL.revokeObjectURL(shot);
    setShot(null);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch (cause) {
        if (cancelled) return;
        toast.add({
          type: 'error',
          title:
            cause instanceof DOMException && cause.name === 'NotAllowedError'
              ? 'Camera permission denied.'
              : 'Could not open the camera.',
        });
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [open]);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d')!;
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.9),
    );

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (!blob) {
      toast.add({ type: 'error', title: 'Could not capture the photo.' });
      return;
    }

    setShot(URL.createObjectURL(blob));

    const path = `${hangoutId}/${nanoid()}.jpg`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from('hangout-photos')
      .upload(path, blob, { contentType: 'image/jpeg' });
    if (uploadError) {
      toast.add({ type: 'error', title: uploadError.message });
      return;
    }

    const { data: signed } = await supabase.storage
      .from('hangout-photos')
      .createSignedUrl(path, 60 * 60);
    if (signed?.signedUrl) onAdd({ path, url: signed.signedUrl });
  }, [hangoutId, onAdd]);

  useEffect(() => {
    if (!ready) return;

    let remaining = COUNTDOWN;

    const timer = setInterval(() => {
      remaining -= 1;
      setCount(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        capture();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [ready, capture]);

  return (
    <>
      <div className="pointer-events-none fixed right-[max(0rem,calc(50vw_-_250px))] bottom-[86px] z-40 size-[176px] overflow-hidden">
        <button
          type="button"
          onClick={openCamera}
          aria-label="Take a photo"
          className="flex pointer-events-auto absolute p-2 top-[18px] right-[-118px] size-[140px] rotate-[-18deg] rounded-[14px] bg-[#494949] shadow-[0_4px_16px_0_rgba(0,0,0,0.5)] outline-none"
        >
          <IconCameraFilled className="size-[19px] text-white opacity-50" />
        </button>
      </div>

      <Overlay
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : closeCamera())}
      >
        {shot ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={shot}
            alt="Photo just taken"
            className="size-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="size-full -scale-x-100 object-cover"
          />
        )}

        {!shot && ready && count > 0 && (
          <span
            key={count}
            className="absolute inset-0 flex animate-in items-center justify-center text-[128px] leading-none font-semibold text-white tabular-nums drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] zoom-in-50"
          >
            {count}
          </span>
        )}

        <OverlayClose className="absolute top-3 right-3" />
      </Overlay>
    </>
  );
}
