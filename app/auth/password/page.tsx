import { PasswordForm } from './password-form';

export default async function PasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main>
      <h1>Enter your password</h1>
      <PasswordForm email={email ?? ''} />
    </main>
  );
}
