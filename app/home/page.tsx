import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>Protected home page</h1>

      <Link href="/user">Account</Link>
      <Link href="/buddies">Buddies</Link>
      <Link href="/hangouts">Hangouts</Link>
      <Link href="/notifications">Notifications</Link>
    </main>
  );
}
