'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import puppy from '@/public/puppy.jpg';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/page-header';
import { createClient } from '@/lib/supabase/client';
import { FieldError } from '@/components/ui/field';

export default function CompliancePage() {
  const router = useRouter();
  const [underage, setUnderage] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.updateUser({
      data: { compliance_accepted_at: new Date().toISOString() },
    });
    if (authError) {
      setError(authError.message);
      setPending(false);
      return;
    }

    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      setError(refreshError.message);
      setPending(false);
      return;
    }

    if (data.user.user_metadata.name) {
      router.push('/user/edit-profile?initial');
    } else {
      router.push('/auth/set-name');
    }
  }

  return (
    <main className="flex flex-1 flex-col pb-6">
      <PageHeader />
      {underage ? (
        <div className="mt-auto flex flex-col gap-6 px-4">
          <h1 className="text-2xl font-semibold text-muted-foreground">
            Don&apos;t drink, <span className="text-foreground">lil bro!</span>
          </h1>
          <Image
            src={puppy}
            alt="A puppy"
            placeholder="blur"
            className="h-auto w-full rounded-[14px]"
          />
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-6 px-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-muted-foreground">
              Are you{' '}
              <span className="text-foreground">over 18 👨🏻 years old?</span>
            </h1>
            <p className="text-base text-muted-foreground">
              Alcohol consumption can be harmful. If tracking it could
              negatively affect your wellbeing, you should avoid using the app.
            </p>
            <FieldError>{error}</FieldError>
          </div>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              size="lg"
              disabled={pending}
              onClick={handleConfirm}
            >
              {pending ? 'Confirming…' : 'Yes, I’m over 18'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setUnderage(true)}
            >
              No, I&apos;m under 18
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
