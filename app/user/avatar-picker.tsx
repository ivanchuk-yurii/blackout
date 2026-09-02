'use client';

import { useRef, useState } from 'react';
import AvatarEditor, { useAvatarEditor } from 'react-avatar-editor';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import { Overlay, OverlayClose } from '@/components/common/overlay';
import { toast } from '@/components/ui/toast';
import { UserAvatar } from '@/components/common/user-avatar';

const SIZE = 512;

function touchDistance(touches: React.TouchList) {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY,
  );
}

export function AvatarPicker({
  avatar: initialAvatar,
  ...user
}: Tables<'users'>) {
  const { ref: editorRef, getImageScaledToCanvas } = useAvatarEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);

  const [avatar, setAvatar] = useState(initialAvatar);
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(1);
  const [pending, setPending] = useState(false);

  function handleTouchStart(event: React.TouchEvent) {
    if (event.touches.length !== 2) return;
    pinchRef.current = { distance: touchDistance(event.touches), scale };
    event.stopPropagation();
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (event.touches.length !== 2) return;
    event.stopPropagation();

    const pinch = (pinchRef.current ??= {
      distance: touchDistance(event.touches),
      scale,
    });

    const next = pinch.scale * (touchDistance(event.touches) / pinch.distance);
    setScale(Math.min(3, Math.max(1, next)));
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (event.touches.length < 2) pinchRef.current = null;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = '';
    if (!picked) return;

    setFile(picked);
    setScale(1);
  }

  async function handleSave() {
    const canvas = getImageScaledToCanvas();
    if (!canvas) return;

    setPending(true);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.8),
    );

    if (!blob) {
      toast.add({
        type: 'error',
        title: 'Could not process that image.',
      });
      setPending(false);
      return;
    }

    const path = `${user.id}/${nanoid()}.jpg`;
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(path, blob, {
        contentType: blob.type,
        cacheControl: '31536000',
      });
    if (uploadError) {
      toast.add({ type: 'error', title: uploadError.message });
      setPending(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('user-avatars').getPublicUrl(path);

    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar: publicUrl })
      .eq('id', user.id);
    if (updateError) {
      toast.add({ type: 'error', title: updateError.message });
      setPending(false);
      return;
    }

    setAvatar(publicUrl);
    setFile(null);
    setPending(false);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Change profile photo"
        className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <UserAvatar {...user} avatar={avatar} className="size-20 text-xl" />
      </button>

      <Overlay
        open={file != null}
        onOpenChange={(next) => {
          if (!next) setFile(null);
        }}
      >
        <OverlayClose disabled={pending} className="absolute top-3 right-3" />

        <div
          className="flex flex-1 flex-col items-center justify-center gap-4 px-6"
          style={{ touchAction: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {file && (
            <AvatarEditor
              ref={editorRef}
              image={file}
              width={SIZE}
              height={SIZE}
              border={0}
              borderRadius={SIZE / 2}
              color={[0, 0, 0, 0.55]}
              scale={scale}
              onLoadFailure={() =>
                toast.add({
                  type: 'error',
                  title: 'Could not read that image.',
                })
              }
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 'var(--radius)',
                touchAction: 'none',
              }}
            />
          )}
        </div>

        <div className="flex flex-col gap-2 p-6">
          <Button size="lg" onClick={handleSave} disabled={pending}>
            {pending ? 'Saving…' : 'Save photo'}
          </Button>
        </div>
      </Overlay>
    </>
  );
}
