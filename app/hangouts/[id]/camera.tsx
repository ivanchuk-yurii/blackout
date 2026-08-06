'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Photo = { path: string; url: string };

export function Camera({
  hangoutId,
  canAdd,
  initialPhotos,
}: {
  hangoutId: string;
  canAdd: boolean;
  initialPhotos: Photo[];
}) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState(initialPhotos);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function openCamera() {
    setError(null);
    setReady(false);
    setOpen(true);
  }

  // Acquire the front camera only while the view is open, and always release
  // the tracks on close/unmount so the camera indicator turns off.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
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
        setError(
          cause instanceof DOMException && cause.name === 'NotAllowedError'
            ? 'Camera permission denied.'
            : 'Could not open the camera.',
        );
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [open]);

  async function handleCapture() {
    const video = videoRef.current;
    if (!video) return;

    setPending(true);
    setError(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')!.drawImage(video, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.9),
      );
      if (!blob) throw new Error('Could not capture the photo.');

      // First path segment must be the hangout id — the storage RLS policy
      // checks it via private.is_hangout_participant.
      const path = `${hangoutId}/${crypto.randomUUID()}.jpg`;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from('hangout-photos')
        .upload(path, blob, { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      // Private bucket: mint a short-lived URL to show the result.
      const { data, error: urlError } = await supabase.storage
        .from('hangout-photos')
        .createSignedUrl(path, 60 * 60);
      if (urlError) throw urlError;

      setPhotos((current) => [{ path, url: data.signedUrl }, ...current]);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed.');
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(path: string) {
    setError(null);
    setDeleting(path);
    try {
      const supabase = createClient();
      const { error: removeError } = await supabase.storage
        .from('hangout-photos')
        .remove([path]);
      if (removeError) throw removeError;

      setPhotos((current) => current.filter((photo) => photo.path !== path));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section>
      <h2>Photos</h2>

      {error && <p role="alert">{error}</p>}

      <ul>
        {photos.map((photo) => (
          <li key={photo.path}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="Hangout photo" width={80} height={80} />
            <button
              onClick={() => handleDelete(photo.path)}
              disabled={deleting === photo.path}
            >
              {deleting === photo.path ? 'Deleting…' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>

      {canAdd &&
        (open ? (
          <div>
            {/* playsInline + muted are required for inline preview on iOS. */}
            <video ref={videoRef} playsInline muted autoPlay />
            <button onClick={handleCapture} disabled={!ready || pending}>
              {pending ? 'Uploading…' : 'Take photo'}
            </button>
            <button onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={openCamera}>Open camera</button>
        ))}
    </section>
  );
}
