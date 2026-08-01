'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateShare } from '@/lib/utils/generate-share';
import { QRCodeSVG } from 'qrcode.react';

export function Share({ hangoutId }: { hangoutId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleShare() {
    setPending(true);

    const supabase = createClient();

    const { token, expires_at } = generateShare();

    await supabase
      .from('hangout_shares')
      .insert({
        id: hangoutId,
        token,
        expires_at,
      })
      .throwOnError();

    setUrl(`${window.location.origin}/hangouts/${hangoutId}?token=${token}`);
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
      {pending ? 'Sharing hangout…' : 'Share hangout'}
    </button>
  );
}
