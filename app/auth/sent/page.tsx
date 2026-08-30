import { redirect } from 'next/navigation';
import { SentView, type SentType } from './sent-view';

const TYPES: SentType[] = ['register', 'password'];

function isSentType(value: unknown): value is SentType {
  return typeof value === 'string' && TYPES.includes(value as SentType);
}

export default async function SentPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string | string[];
    type?: string | string[];
  }>;
}) {
  const { email, type } = await searchParams;

  if (typeof email !== 'string' || !email || !isSentType(type)) {
    redirect('/auth');
  }

  return <SentView email={email} type={type} />;
}
