'use client';

import { useState } from 'react';
import { IconEye, IconEyeOff, IconLockPassword } from '@tabler/icons-react';

import { cn } from '@/lib/utils/tailwind';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PasswordInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative flex items-center">
      <IconLockPassword className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type={visible ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="Password"
        className={cn('pl-9', 'pr-9', className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-1 my-auto text-muted-foreground"
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <IconEyeOff /> : <IconEye />}
      </Button>
    </div>
  );
}
