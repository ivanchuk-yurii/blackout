'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateShare } from '@/lib/utils/generate-share';
import { QRCodeSVG } from 'qrcode.react';

export function Share() {
  const [url, setUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleShare() {
    setPending(true);

    const supabase = createClient();

    const { data: auth } = await supabase.auth.getClaims();
    if (!auth?.claims) return null;

    const id = auth.claims.sub;
    const { token, expires_at } = generateShare();

    await supabase
      .from('buddy_shares')
      .insert({
        id,
        token,
        expires_at,
      })
      .throwOnError();

    setUrl(`${window.location.origin}/buddies/${id}?token=${token}`);
    setPending(false);
  }

  return url ? (
    <>
      {url}
      <QRCodeSVG
        value={url}
        size={200}
        bgColor="#ffffff"
        fgColor="#1a1a2e"
        level="H"
      />
    </>
  ) : (
    <button type="button" onClick={handleShare} disabled={pending}>
      {pending ? 'Sharing profile…' : 'Share profile'}
    </button>
  );
}
