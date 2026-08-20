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
  simulateIntake,
} from '@/lib/utils/calculate-intake';
import type { Tables } from '@/lib/supabase/types';
import { type FullHangoutDrink } from '@/lib/supabase/custom-types';

const HEAT = {
  soft: 'var(--chart-soft)',
  mild: 'var(--chart-mild)',
  strong: 'var(--chart-strong)',
};

function formatTime(time: number) {
  return new Date(time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Stats({
  profile,
  hangoutDrinks,
}: {
  profile: Tables<'user_profiles'> | null;
  hangoutDrinks: FullHangoutDrink[];
}) {
  const points = simulateIntake(profile, hangoutDrinks);

  if (points.length === 0) return null;

  const peak = Math.max(...points.map((point) => point.rate));
  const yMax = Math.max(peak * 1.15, MILD_MAX * 1.4);

  const bandTicks = [
    { value: SOFT_MAX / 2, name: 'soft' },
    { value: (SOFT_MAX + MILD_MAX) / 2, name: 'mild' },
    { value: (MILD_MAX + yMax) / 2, name: 'strong' },
  ];
  const bandNames = new Map(bandTicks.map((tick) => [tick.value, tick.name]));

  return (
    <figure className="my-6">
      <figcaption
        className="mb-1 text-sm"
        style={{ color: 'var(--chart-label)' }}
      >
        Drinking intensity
      </figcaption>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0 }}>
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
            tickFormatter={formatTime}
            tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
            stroke="var(--chart-axis)"
            tickLine={false}
            minTickGap={40}
          />

          <YAxis
            domain={[0, yMax]}
            ticks={bandTicks.map((tick) => tick.value)}
            tickFormatter={(value: number) => bandNames.get(value) ?? ''}
            tick={{ fill: 'var(--chart-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />

          <Line
            type="bumpX"
            dataKey="rate"
            stroke="var(--chart-line)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}
