import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>Protected home page</h1>

      <Link href="/user">Account</Link>
    </main>
  );
}
