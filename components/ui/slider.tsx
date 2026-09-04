'use client';

import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { cn } from '@/lib/utils/tailwind';

function Slider({ className, children, ...props }: SliderPrimitive.Root.Props) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      thumbAlignment="edge"
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </SliderPrimitive.Root>
  );
}

function SliderControl({ className, ...props }: SliderPrimitive.Control.Props) {
  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      className={cn(
        'flex w-full touch-none items-center py-3 select-none',
        className,
      )}
      {...props}
    />
  );
}

function SliderTrack({ className, ...props }: SliderPrimitive.Track.Props) {
  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      className={cn('h-2 w-full rounded-full bg-muted select-none', className)}
      {...props}
    />
  );
}

function SliderIndicator({
  className,
  ...props
}: SliderPrimitive.Indicator.Props) {
  return (
    <SliderPrimitive.Indicator
      data-slot="slider-indicator"
      className={cn('rounded-full bg-primary select-none', className)}
      {...props}
    />
  );
}

function SliderThumb({ className, ...props }: SliderPrimitive.Thumb.Props) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className={cn(
        'size-5 rounded-full border border-primary bg-background shadow-sm transition-transform select-none data-dragging:scale-110 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
        className,
      )}
      {...props}
    />
  );
}

function SliderValue({ className, ...props }: SliderPrimitive.Value.Props) {
  return (
    <SliderPrimitive.Value
      data-slot="slider-value"
      className={cn('text-sm tabular-nums', className)}
      {...props}
    />
  );
}

export {
  Slider,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
  SliderValue,
};
