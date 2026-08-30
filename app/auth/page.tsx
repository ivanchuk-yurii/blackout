import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FieldSeparator } from '@/components/ui/field';
import logo from '@/public/logo.png';
import { GoogleButton } from './google-button';

export default function AuthPage() {
  return (
    <main className="flex flex-1 flex-col px-4 pt-8 pb-6">
      <Image src={logo} alt="Blackout" height={48} />
      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Tonight’s plans just got <br /> ✨ better ✨ <br />
        <span className="text-foreground/50">
          Track drinks 🍸, places 📍 and the stories 📸
        </span>{' '}
        <br />
        you’ll probably forget 🫠
      </h1>
      <div className="mt-auto flex flex-col gap-4">
        <GoogleButton />
        <FieldSeparator className="my-0 h-4 text-xs">OR</FieldSeparator>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/auth/register" />}
        >
          Create account
        </Button>
        <Button
          variant="secondary"
          size="lg"
          nativeButton={false}
          render={<Link href="/auth/login" />}
        >
          Sign in
        </Button>
      </div>
    </main>
  );
}
