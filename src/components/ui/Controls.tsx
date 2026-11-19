"use client";

import { Minus, Plus, Star } from "lucide-react";

interface Option<T extends string> {
  readonly value: T;
  readonly label: string;
}

interface ChoiceProps<T extends string> {
  readonly options: readonly Option<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: ChoiceProps<T>) {
  return (
    <div className="flex rounded-xl border border-hairline bg-void p-1" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${o.value === value ? "bg-graphite text-ink shadow" : "text-ink-faint hover:text-ink-muted"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ChipRow<T extends string>({ options, value, onChange }: ChoiceProps<T>) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`press shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${o.value === value ? "border-volt bg-volt text-void" : "border-hairline bg-carbon text-ink-muted hover:text-ink"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  readonly checked: boolean;
  readonly onChange: () => void;
  readonly label: string;
  readonly disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${checked ? "bg-volt" : "bg-hairline"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`}
      />
    </button>
  );
}

export function StarRating({
  value,
  onChange,
  size = "md",
}: {
  readonly value: number;
  readonly onChange?: (value: number) => void;
  readonly size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-7 w-7";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Star
            className={`${cls} ${n <= value ? "fill-series-rehab text-series-rehab" : "text-hairline"}`}
          />
        );
        return onChange === undefined ? (
          <span key={n}>{star}</span>
        ) : (
          <button
            key={n}
            type="button"
            className="press"
            aria-label={`${n} stars`}
            onClick={() => onChange(n)}
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({
  value,
  onChange,
  min,
  max,
}: {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly min: number;
  readonly max: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-hairline bg-void p-1">
      <button
        type="button"
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="press rounded-lg bg-graphite p-2 disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="metric w-8 text-center text-lg font-bold">{value}</span>
      <button
        type="button"
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="press rounded-lg bg-graphite p-2 disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
