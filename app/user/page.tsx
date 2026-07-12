import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './logout-button';

export default async function UserPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <main>
      <h1>Account</h1>
      <p>Signed in as {user.email}</p>
      <p>Name: {user.user_metadata?.name ?? '—'}</p>
      <ul>
        <li>
          <Link href="/user/set-name">Change name</Link>
        </li>
        <li>
          <Link href="/user/set-password">Change password</Link>
        </li>
      </ul>
      <LogoutButton />
    </main>
  );
}
