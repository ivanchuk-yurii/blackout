'use client';

import {
  ResponsiveContainer,
  Line,
  LineChart,
  ReferenceArea,
  XAxis,
  YAxis,
} from 'recharts';

import {
  MILD_MAX,
  SOFT_MAX,
  calculateTotals,
  simulateIntake,
} from '@/lib/utils/calculate-intake';
import type { Tables } from '@/lib/supabase/types';
import { type FullHangoutDrink } from '@/lib/supabase/custom-types';

const HEAT: Record<string, string> = {
  soft: 'var(--chart-soft)',
  mild: 'var(--chart-mild)',
  strong: 'var(--chart-strong)',
};

const WHOLE = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
const DECIMAL = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });

const TIME = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
});

export function StatsChart({
  profile,
  hangoutDrinks,
  endedAt,
}: {
  profile: Tables<'user_profiles'> | null;
  hangoutDrinks: FullHangoutDrink[];
  endedAt: string | null;
}) {
  const points = simulateIntake(profile, hangoutDrinks, endedAt);

  if (points.length === 0) return null;

  const peak = Math.max(...points.map((point) => point.rate));
  const yMax = Math.max(peak * 1.15, MILD_MAX * 1.4);

  const { volume, units, calories } = calculateTotals(hangoutDrinks);
  const totals = [
    { label: 'Drinks', value: WHOLE.format(hangoutDrinks.length) },
    { label: 'Volume', value: `${WHOLE.format(volume)} ml` },
    { label: 'Units', value: DECIMAL.format(units) },
    { label: 'Calories', value: `${WHOLE.format(calories)} kcal` },
  ];

  return (
    <>
      <dl className="flex items-baseline justify-between gap-3 py-3">
        {totals.map((total) => (
          <div key={total.label} className="min-w-0">
            <dt className="truncate text-xs text-muted-foreground">
              {total.label}
            </dt>
            <dd className="truncate font-heading text-lg font-medium tabular-nums">
              {total.value}
            </dd>
          </div>
        ))}
      </dl>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={points}>
          <defs>
            <linearGradient id="intake-heat" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor={HEAT.strong} stopOpacity={1} />
              <stop
                offset={1 - MILD_MAX / yMax}
                stopColor={HEAT.mild}
                stopOpacity={1}
              />
              <stop
                offset={1 - SOFT_MAX / yMax}
                stopColor={HEAT.soft}
                stopOpacity={0.8}
              />
              <stop offset={1} stopColor={HEAT.soft} stopOpacity={0.2} />
            </linearGradient>
          </defs>

          <ReferenceArea
            y1={0}
            y2={yMax}
            fill="url(#intake-heat)"
            fillOpacity={0.22}
            stroke="none"
          />

          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={TIME.format}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            stroke="var(--border)"
            tickLine={false}
            minTickGap={40}
          />

          <YAxis domain={[0, yMax]} hide />

          <Line
            type="bumpX"
            dataKey="rate"
            stroke="var(--foreground)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
