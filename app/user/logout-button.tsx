'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    setPending(false);
    router.push('/auth');
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} disabled={pending}>
      {pending ? 'Logging out…' : 'Log out'}
    </button>
  );
}
