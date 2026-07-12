import Link from 'next/link';
import { GoogleButton } from './google-button';

export default function AuthPage() {
  return (
    <main>
      <h1>Welcome</h1>
      <ul>
        <li>
          <Link href="/auth/login">Login</Link>
        </li>
        <li>
          <Link href="/auth/register">Register</Link>
        </li>
      </ul>
      <GoogleButton />
    </main>
  );
}
