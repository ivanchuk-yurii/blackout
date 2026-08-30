import { IconMail } from '@tabler/icons-react';

import { cn } from '@/lib/utils/tailwind';
import { Input } from '@/components/ui/input';

export function EmailInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative flex items-center">
      <IconMail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="email"
        autoComplete="email"
        placeholder="Enter your email"
        className={cn('pl-9', className)}
        {...props}
      />
    </div>
  );
}
