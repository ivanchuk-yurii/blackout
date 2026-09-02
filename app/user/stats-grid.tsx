import Link from 'next/link';
import {
  IconConfetti,
  IconGlassCocktail,
  IconMapPin2,
  IconMoodCrazyHappy,
} from '@tabler/icons-react';

const stats = [
  {
    key: 'buddies',
    label: 'Buddies',
    href: '/buddies',
    Icon: IconMoodCrazyHappy,
    tilt: '-rotate-2',
  },
  {
    key: 'hangouts',
    label: 'Hangouts',
    href: '/hangouts',
    Icon: IconConfetti,
    tilt: 'rotate-1',
  },
  {
    key: 'spots',
    label: 'Spots',
    href: '/user/spots',
    Icon: IconMapPin2,
    tilt: '-rotate-4',
  },
  {
    key: 'drinks',
    label: 'Drinks',
    href: '/user/drinks',
    Icon: IconGlassCocktail,
    tilt: 'rotate-2',
  },
] as const;

type StatsGridProps = Record<(typeof stats)[number]['key'], number>;

export function StatsGrid(counts: StatsGridProps) {
  return (
    <div className="mt-4 flex items-center justify-center">
      {stats.map(({ key, label, href, Icon, tilt }) => (
        <Link
          key={key}
          href={href}
          className={`${tilt} -mr-2 flex h-22 flex-1 flex-col justify-between rounded-xl border border-white/8 bg-linear-to-b from-secondary to-[#171717] px-2.5 pt-2.5 pb-2 shadow-lg transition-transform last:mr-0 active:scale-95`}
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="size-4 shrink-0" />
            <span className="truncate text-xs/4">{label}</span>
          </div>
          <span className="bg-linear-to-b from-[#fafafa] to-[#807a7a] bg-clip-text text-2xl/8 font-medium tabular-nums text-transparent">
            {counts[key]}
          </span>
        </Link>
      ))}
    </div>
  );
}
