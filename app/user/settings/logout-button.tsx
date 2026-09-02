'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.add({ type: 'error', title: error.message });
      setPending(false);
      return;
    }

    setPending(false);
    router.push('/auth');
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="lg"
      onClick={handleLogout}
      disabled={pending}
    >
      {pending ? 'Logging out…' : 'Log out'}
    </Button>
  );
}
