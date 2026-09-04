'use client';

import { type Enums } from '@/lib/supabase/types';
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from '@/components/ui/slider';

type VolumeRange = { min: number; max: number; default: number };

export const PINT = 568;
export const HALF_PINT = PINT / 2 + 1;

export const VOLUME_RANGES: Record<Enums<'drink_categories'>, VolumeRange> = {
  beer: { min: HALF_PINT, max: PINT, default: 500 },
  cider: { min: HALF_PINT, max: PINT, default: 500 },
  wine: { min: 125, max: 250, default: 175 },
  spirit: { min: 25, max: 100, default: 50 },
  cocktail: { min: 100, max: 350, default: 200 },
};

export function VolumeSlider({
  category,
  value,
  onValueChange,
  min,
  max,
  disabled,
}: {
  category: Enums<'drink_categories'>;
  value: number;
  onValueChange: (volume: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  const range = VOLUME_RANGES[category];
  const isPintCategory = category === 'beer' || category === 'cider';

  return (
    <Slider
      value={value}
      onValueChange={(next) =>
        onValueChange(Array.isArray(next) ? next[0] : next)
      }
      min={min ?? range.min}
      max={max ?? range.max}
      step={5}
      disabled={disabled}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate text-sm text-muted-foreground">
          Volume
        </span>
        <SliderValue className="shrink-0 font-heading text-2xl font-medium">
          {(formatted, values) =>
            isPintCategory && values[0] === PINT ? (
              'Pint'
            ) : isPintCategory && values[0] === HALF_PINT ? (
              'Half pint'
            ) : (
              <>
                {formatted[0]}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ml
                </span>
              </>
            )
          }
        </SliderValue>
      </div>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb aria-label="Volume in millilitres" />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}
