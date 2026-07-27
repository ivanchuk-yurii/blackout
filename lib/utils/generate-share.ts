import { nanoid } from 'nanoid';

export function generateShare(): {
  token: string;
  expires_at: string;
} {
  const token = nanoid();
  const expires = new Date();
  expires.setDate(expires.getDate() + 1);

  return {
    token: token,
    expires_at: expires.toISOString(),
  };
}
