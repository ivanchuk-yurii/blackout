'use client';

import type { ReactNode } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { IconX } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

export function Overlay({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Popup
          data-slot="overlay"
          className="fixed inset-0 z-50 flex flex-col bg-background outline-none"
        >
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function OverlayClose({
  className,
  disabled,
}: {
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Dialog.Close
      render={
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="Close"
          disabled={disabled}
          className={className}
        >
          <IconX />
        </Button>
      }
    />
  );
}
