import Link from 'next/link';
import { IconGlassFull, IconMapPin } from '@tabler/icons-react';
import { Tables } from '@/lib/supabase/types';
import { photoUrl } from '@/lib/google-maps/utils';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export function HangoutList({
  hangouts,
}: {
  hangouts: Tables<'hangouts_feed'>[];
}) {
  if (!hangouts.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconGlassFull />
          </EmptyMedia>
          <EmptyTitle>No hangouts</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            Hangouts you and your buddies start will show up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="mt-4 flex flex-col gap-3 px-4">
      {hangouts.map((hangout) => (
        <li key={hangout.id}>
          <Link
            href={`/hangouts/${hangout.id}`}
            className="flex items-center gap-4 rounded-xl border border-white/8 bg-linear-to-b from-secondary to-[#171717] p-3 shadow-lg transition-transform active:scale-95"
          >
            {hangout.spot_image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photoUrl(hangout.spot_image)}
                alt=""
                className="size-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted"
              >
                <IconMapPin className="size-6 text-muted-foreground" />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-lg/7 font-medium">{hangout.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {hangout.spot_name ?? 'No spot yet'}
              </p>
            </div>

            {hangout.started_at && (
              <span className="shrink-0 text-xs text-muted-foreground">
                started {formatRelativeTime(hangout.started_at)}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
