'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Tables, Enums } from '@/lib/supabase/types';

export function ProfileForm({
  userId,
  initialProfile,
}: {
  userId: string;
  initialProfile: Omit<Tables<'user_profiles'>, 'id'> | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const gender = form.get('gender') as Enums<'gender'>;
    const birthDate = form.get('birth_date') as string;
    const weight = Number(form.get('weight'));
    const height = Number(form.get('height'));

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('user_profiles').upsert({
      id: userId,
      gender,
      birth_date: birthDate,
      weight,
      height,
    });
    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    router.push('/user');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          name="gender"
          defaultValue={initialProfile?.gender ?? ''}
          required
        >
          <option value="" disabled>
            Select…
          </option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div>
        <label htmlFor="birth_date">Birth date</label>
        <input
          id="birth_date"
          name="birth_date"
          type="date"
          defaultValue={initialProfile?.birth_date ?? ''}
          required
        />
      </div>
      <div>
        <label htmlFor="weight">Weight (kg)</label>
        <input
          id="weight"
          name="weight"
          type="number"
          min={20}
          max={300}
          step={1}
          defaultValue={initialProfile?.weight ?? ''}
          required
        />
      </div>
      <div>
        <label htmlFor="height">Height (cm)</label>
        <input
          id="height"
          name="height"
          type="number"
          min={50}
          max={250}
          step={1}
          defaultValue={initialProfile?.height ?? ''}
          required
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
