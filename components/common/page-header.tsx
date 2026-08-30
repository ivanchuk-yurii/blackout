'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IconChevronLeft } from '@tabler/icons-react';

import logo from '@/public/logo.png';
import { Button } from '@/components/ui/button';

export function PageHeader({
  title,
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  const router = useRouter();

  const handleBack = () => {
    const fromAuth = new URLSearchParams(window.location.search).has(
      'from-auth',
    );
    if (fromAuth) router.push('/home');
    else router.back();
  };

  return (
    <header className="relative flex items-center justify-between px-3 pt-4">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label="Go back"
        onClick={handleBack}
      >
        <IconChevronLeft className="size-5" />
      </Button>
      {title ? (
        <p className="absolute left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
          {title}
        </p>
      ) : (
        <Image
          src={logo}
          alt="Blackout"
          height={24}
          className="absolute left-1/2 -translate-x-1/2"
        />
      )}
      {children && <div className="flex items-center gap-1">{children}</div>}
    </header>
  );
}
