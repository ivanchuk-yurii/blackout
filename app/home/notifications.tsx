import Link from 'next/link';
import { IconBell } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

export function Notifications({ count }: { count: number }) {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="opacity-50"
        aria-label={count ? `Notifications, ${count} unread` : 'Notifications'}
        nativeButton={false}
        render={<Link href="/notifications" />}
      >
        <IconBell className="size-6" />
      </Button>

      {!!count && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px]/none font-medium tabular-nums text-primary-foreground"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
}
