import Link from 'next/link';
import { IconChevronRight, IconLock, IconRuler } from '@tabler/icons-react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { LogoutButton } from './logout-button';

export default async function SettingsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Settings" />

      <div className="flex flex-col gap-2 p-4">
        <Button
          variant="secondary"
          size="lg"
          nativeButton={false}
          className="justify-between"
          render={<Link href="/user/edit-profile" />}
        >
          <span className="flex items-center gap-2">
            <IconRuler className="size-5" />
            Body stats
          </span>
          <IconChevronRight className="size-4 text-muted-foreground" />
        </Button>

        <Button
          variant="secondary"
          size="lg"
          nativeButton={false}
          className="justify-between"
          render={<Link href="/auth/set-password" />}
        >
          <span className="flex items-center gap-2">
            <IconLock className="size-5" />
            Change password
          </span>
          <IconChevronRight className="size-4 text-muted-foreground" />
        </Button>

        <LogoutButton />
      </div>
    </main>
  );
}
