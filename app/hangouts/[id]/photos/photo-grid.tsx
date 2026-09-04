'use client';

import { useState } from 'react';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { type Photo } from '@/lib/supabase/custom-types';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Overlay, OverlayClose } from '@/components/common/overlay';

function tilt(path: string) {
  const id = path.split('/').pop()!.split('.')[0];

  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0;
  }
  return ((Math.abs(hash) % 1001) / 1000) * 10 - 5;
}

function downloadUrl(url: string) {
  const next = new URL(url);
  next.searchParams.set('download', '');
  return next.toString();
}

export function PhotoGrid({ initialPhotos }: { initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [active, setActive] = useState<Photo | null>(null);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!active) return;

    setPending(true);

    const supabase = createClient();
    const { error } = await supabase.storage
      .from('hangout-photos')
      .remove([active.path]);
    if (error) {
      toast.add({ type: 'error', title: error.message });
      setPending(false);
      return;
    }

    setPhotos((current) =>
      current.filter((photo) => photo.path !== active.path),
    );
    setPending(false);
    setActive(null);
  }

  return (
    <>
      <ul className="grid grid-cols-2 p-4">
        {photos.map((photo) => (
          <li key={photo.path} style={{ rotate: `${tilt(photo.path)}deg` }}>
            <button
              type="button"
              aria-label="Open photo"
              onClick={() => setActive(photo)}
              className="block w-full rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt="Hangout photo"
                loading="lazy"
                decoding="async"
                className="aspect-square w-full rounded-lg bg-muted object-cover shadow-[0_4px_16px_0_rgba(0,0,0,0.5)]"
              />
            </button>
          </li>
        ))}
      </ul>

      <Overlay
        open={active != null}
        onOpenChange={(next) => {
          if (!next) setActive(null);
        }}
      >
        {active && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.url}
              alt="Hangout photo"
              className="size-full object-contain"
            />

            <OverlayClose
              disabled={pending}
              className="absolute top-3 right-3 rounded-full bg-black/40 text-white hover:bg-black/60"
            />

            <div className="absolute inset-x-0 bottom-0 flex gap-3 p-6 bg-black">
              <Button
                variant="secondary"
                size="lg"
                nativeButton={false}
                className="flex-1"
                render={
                  <a href={downloadUrl(active.url)} download>
                    <IconDownload />
                    Download
                  </a>
                }
              />
              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={handleDelete}
                disabled={pending}
                className="flex-1"
              >
                <IconTrash />
                {pending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </>
        )}
      </Overlay>
    </>
  );
}
