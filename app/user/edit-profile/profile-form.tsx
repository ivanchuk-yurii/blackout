'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconCalendar,
  IconChevronDown,
  IconRulerMeasure2,
  IconWeight,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/tailwind';
import { Constants, type Tables, type Enums } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function ProfileForm({
  userId,
  initialProfile,
  initial,
}: {
  userId: string;
  initialProfile: Omit<Tables<'user_profiles'>, 'id'> | null;
  initial: boolean;
}) {
  const router = useRouter();
  const [gender, setGender] = useState<Enums<'gender'> | null>(
    initialProfile?.gender ?? null,
  );
  const [birthDate, setBirthDate] = useState(initialProfile?.birth_date ?? '');
  const [weight, setWeight] = useState(
    initialProfile?.weight?.toString() ?? '',
  );
  const [height, setHeight] = useState(
    initialProfile?.height?.toString() ?? '',
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resetPending, setResetPending] = useState(false);

  const complete = Boolean(gender && birthDate && weight && height);
  const dirty =
    !initialProfile ||
    initialProfile.gender !== gender ||
    initialProfile.birth_date !== birthDate ||
    initialProfile.weight.toString() !== weight ||
    initialProfile.height.toString() !== height;

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gender) return;

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: upsertError } = await supabase.from('user_profiles').upsert({
      id: userId,
      gender,
      birth_date: birthDate,
      weight: Number(weight),
      height: Number(height),
    });
    if (upsertError) {
      setError(upsertError.message);
      setPending(false);
      return;
    }

    if (initial) {
      router.push('/home');
    } else {
      router.back();
    }
  }

  async function handleReset() {
    setResetPending(true);
    setError(null);

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);
    setResetPending(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setGender(null);
    setBirthDate('');
    setWeight('');
    setHeight('');
    router.back();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 flex flex-1 flex-col gap-6 px-4 pb-6"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl leading-8 font-medium">Your parameters</h1>
        <p className="text-sm text-muted-foreground">
          We use this data to calculate amount of alcohol in your blood (used in
          all fun stats). Only visible to you
        </p>
      </div>
      <FieldGroup className="gap-6">
        <Field aria-labelledby="gender-label">
          <p id="gender-label" className="text-sm font-medium">
            Gender
          </p>
          <div className="flex gap-4">
            {Constants.public.Enums.gender.map((value) => (
              <Button
                key={value}
                type="button"
                variant={gender === value ? 'default' : 'outline'}
                aria-pressed={gender === value}
                className="flex-1 capitalize"
                onClick={() => setGender(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor="birth_date">Date of Birth</FieldLabel>
          <div className="relative">
            <IconCalendar className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="birth_date"
              name="birth_date"
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={cn(
                'appearance-none px-9 [-webkit-appearance:none] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:size-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0',
                !birthDate && '[&::-webkit-datetime-edit]:opacity-0',
              )}
            />
            {!birthDate && (
              <span className="pointer-events-none absolute top-1/2 left-9 -translate-y-1/2 text-base text-muted-foreground">
                Select date
              </span>
            )}
            <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>
        <div className="flex gap-4">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="weight">Weight</FieldLabel>
            <div className="relative">
              <IconWeight className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="weight"
                name="weight"
                type="number"
                inputMode="numeric"
                min={20}
                max={300}
                step={1}
                required
                placeholder="Your weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="pr-12 pl-9 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 w-[30px] -translate-y-1/2 text-right text-sm font-medium text-muted-foreground">
                kg
              </span>
            </div>
          </Field>
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="height">Height</FieldLabel>
            <div className="relative">
              <IconRulerMeasure2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="height"
                name="height"
                type="number"
                inputMode="numeric"
                min={50}
                max={250}
                step={1}
                required
                placeholder="Your height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="pr-12 pl-9 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 w-[30px] -translate-y-1/2 text-right text-sm font-medium text-muted-foreground">
                cm
              </span>
            </div>
          </Field>
        </div>
      </FieldGroup>
      <div className="mt-auto flex flex-col gap-4">
        <FieldError className="text-center">{error}</FieldError>
        <Button
          type="submit"
          size="lg"
          disabled={!complete || !dirty || pending || resetPending}
        >
          {pending ? 'Saving…' : 'Save'}
        </Button>
        {initial ? (
          <Button
            variant="secondary"
            size="lg"
            nativeButton={false}
            disabled={pending}
            render={<Link href="/home" />}
          >
            Skip
          </Button>
        ) : (
          initialProfile && (
            <Button
              type="button"
              variant="destructive"
              size="lg"
              disabled={pending || resetPending}
              onClick={handleReset}
            >
              {resetPending ? 'Resetting…' : 'Reset profile'}
            </Button>
          )
        )}
      </div>
    </form>
  );
}
