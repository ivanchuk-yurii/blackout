'use client';

import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type MouseHandlerDataParam,
} from 'recharts';

import {
  buildDrinkWeeks,
  calculateSafeMaxShare,
  type DrinkWeek,
} from '@/lib/utils/calculate-weekly-drinks';
import { type DrinkMetrics } from '@/lib/supabase/custom-types';

const DAY_MONTH = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const DAY_MONTH_YEAR = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const MONTH = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  timeZone: 'UTC',
});

function formatRange({ start, end }: DrinkWeek) {
  return `${DAY_MONTH.format(start)} - ${DAY_MONTH_YEAR.format(end - 1)}`;
}

function monthTicks(weeks: DrinkWeek[]) {
  const firstWeeks = weeks.filter(({ start }, i) => {
    const previous = weeks[i - 1];
    return (
      !previous ||
      new Date(start).getUTCMonth() !== new Date(previous.start).getUTCMonth()
    );
  });

  return firstWeeks.map(({ start }) => start);
}

export function DrinkingChart({
  drinks,
  weeks,
}: {
  drinks: DrinkMetrics[];
  weeks: number;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const data = buildDrinkWeeks(drinks, weeks);
  const index = selectedIndex ?? data.length - 1;
  const selected = data[index];

  if (!selected) return null;

  const peak = Math.max(...data.map(({ count }) => count));
  const max = Math.max(2, Math.ceil(peak / 2) * 2);

  function selectActive({ activeIndex }: MouseHandlerDataParam) {
    if (activeIndex == null) return;

    const next = Number(activeIndex);
    if (Number.isInteger(next)) setSelectedIndex(next);
  }

  return (
    <section className="mt-6 flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <p className="text-base/6 font-medium">{formatRange(selected)}</p>
        <div className="flex items-center gap-6 whitespace-nowrap">
          <p className="flex items-baseline gap-1">
            <span className="text-2xl/8 font-medium tabular-nums">
              {selected.count}
            </span>
            <span className="text-sm/5 text-muted-foreground">drinks</span>
          </p>
          <p className="flex items-baseline gap-1">
            <span className="text-2xl/8 font-medium tabular-nums">
              {calculateSafeMaxShare(selected.units)}%
            </span>
            <span className="text-sm/5 text-muted-foreground">
              of safe max.
            </span>
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={118} className="touch-pan-y">
        <LineChart
          data={data}
          margin={{ top: 6, right: 0, bottom: 0, left: 0 }}
          onClick={selectActive}
          onTouchMove={selectActive}
          accessibilityLayer={false}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey="start"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            ticks={monthTicks(data)}
            tickFormatter={(start: number) => MONTH.format(start)}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            height={26}
          />

          <YAxis
            orientation="right"
            domain={[0, max]}
            ticks={[0, max / 2, max]}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />

          <ReferenceLine
            x={selected.start}
            stroke="var(--muted-foreground)"
            strokeOpacity={0.5}
          />

          <Line
            type="linear"
            dataKey="count"
            stroke="var(--foreground)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={({ cx, cy, index: i }) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={3}
                fill={i === index ? 'var(--foreground)' : 'var(--background)'}
                stroke="var(--foreground)"
                strokeWidth={2}
              />
            )}
            activeDot={false}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
