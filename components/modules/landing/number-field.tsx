"use client";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

/** A slider and a number box bound to the same value, for amounts a visitor may drag or type. */
export function NumberField({
  id,
  label,
  helper,
  value,
  min,
  max,
  step = 1,
  inputMax,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  helper?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  inputMax?: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-3 flex items-center gap-4">
        <Slider
          value={[Math.min(value, max)]}
          min={min}
          max={max}
          step={step}
          onValueChange={([next]) => onChange(next)}
          aria-label={label}
          className="flex-1"
        />
        <div className="relative">
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={inputMax ?? max}
            value={value}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next) && next >= min) onChange(Math.min(next, inputMax ?? max));
            }}
            className={suffix ? "w-36 pr-12 text-right" : "w-28 text-center"}
          />
          {suffix ? (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
      {helper ? <p className="mt-2 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
