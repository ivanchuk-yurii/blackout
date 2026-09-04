import Link from 'next/link';
import { cn } from '@/lib/utils/tailwind';
import { type Photo } from '@/lib/supabase/custom-types';

const TILES = [
  { tilt: 'rotate-[-2deg]', z: 'z-[5]' },
  { tilt: 'rotate-[3deg]', z: 'z-[4]' },
  { tilt: 'rotate-[5deg]', z: 'z-[3]' },
  { tilt: 'rotate-[-4deg]', z: 'z-[2]' },
  { tilt: 'rotate-[3deg]', z: 'z-[1]' },
];

export function Photos({
  hangoutId,
  photos,
}: {
  hangoutId: string;
  photos: Photo[];
}) {
  if (!photos.length) return null;

  const count = Math.min(photos.length, TILES.length);

  return (
    <Link
      href={`/hangouts/${hangoutId}/photos`}
      className="isolate flex items-center rounded-[7px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {TILES.slice(0, count).map((tile, index) => {
        const photo = photos[index];

        return (
          <div
            key={photo.path}
            className={cn('-mr-5 shrink-0 last:mr-0', tile.z, tile.tilt)}
          >
            <div className="relative size-7 overflow-hidden rounded-[7px] border-[3px] border-[#5b5b5b] bg-[#494949] shadow-[0_1px_4px_0_rgba(0,0,0,0.5)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_4px_3px_rgba(0,0,0,0.25)]" />
            </div>
          </div>
        );
      })}
    </Link>
  );
}
