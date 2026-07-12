import Link from 'next/link';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main>
      <h1>Something went wrong</h1>
      <p role="alert">
        {message ?? 'An unexpected authentication error occurred.'}
      </p>
      <Link href="/auth">Back to sign in</Link>
    </main>
  );
}
