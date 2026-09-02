'use client';

import { useState, useSyncExternalStore } from 'react';
import { nanoid } from 'nanoid';
import { IconCheck, IconCopy, IconShare2 } from '@tabler/icons-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

const subscribe = () => () => {};

export function Share({
  path,
  title = 'Share',
  onShare,
}: {
  path: string;
  title?: string;
  onShare: (token: string) => Promise<{ error?: { message: string } | null }>;
}) {
  const [token, setToken] = useState('');
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => '',
  );
  const canShare = useSyncExternalStore(
    subscribe,
    () => typeof navigator.share === 'function',
    () => false,
  );
  const canCopy = useSyncExternalStore(
    subscribe,
    () => typeof navigator.clipboard?.writeText === 'function',
    () => false,
  );

  const url = `${origin}${path}?token=${token}`;

  async function handleClick() {
    if (token) {
      setOpen(true);
      return;
    }

    setPending(true);

    const next = nanoid();
    const { error } = await onShare(next);
    if (error) {
      toast.add({ type: 'error', title: error.message });
      setPending(false);
      return;
    }

    setToken(next);
    setPending(false);
    setOpen(true);
  }

  async function handleShare() {
    try {
      await navigator.share({ title, url });
    } catch {}
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label={title}
        onClick={handleClick}
        disabled={pending}
      >
        <IconShare2 className="size-5" />
      </Button>

      {token && (
        <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>
                Scan the code or send the link
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-col items-center gap-4 p-4">
              <div className="rounded-2xl bg-white p-4">
                <QRCodeSVG
                  value={url}
                  bgColor="#ffffff"
                  fgColor="#1a1a2e"
                  level="H"
                  width="100%"
                  height="auto"
                />
              </div>
            </div>

            <DrawerFooter>
              {canShare && (
                <Button size="lg" onClick={handleShare}>
                  <IconShare2 />
                  Share link
                </Button>
              )}
              {canCopy && (
                <Button variant="secondary" size="lg" onClick={handleCopy}>
                  {copied ? <IconCheck /> : <IconCopy />}
                  {copied ? 'Copied' : 'Copy link'}
                </Button>
              )}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
