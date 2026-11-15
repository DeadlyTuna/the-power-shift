"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * − / + quantity control. Buttons at a limit use aria-disabled (not
 * disabled) so keyboard focus isn't lost when the limit is reached.
 */
export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label = "Quantity",
  itemName,
  size = "md",
  className,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  /** Accessible name of the control (the visible label is up to the caller). */
  label?: string;
  /** Used in button labels, e.g. "Decrease quantity of Reframe Card Deck". */
  itemName?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const atMin = value <= min;
  const atMax = value >= max;
  const of = itemName ? ` of ${itemName}` : "";
  const button =
    "inline-flex shrink-0 items-center justify-center rounded-full text-jamun-900 transition-colors hover:bg-mist aria-disabled:cursor-not-allowed aria-disabled:text-muted/50 aria-disabled:hover:bg-transparent";
  const dims = size === "sm" ? "size-11" : "size-12";

  return (
    <div
      role="group"
      aria-label={`${label}${of}`}
      className={cn("inline-flex items-center rounded-full border border-line bg-white", className)}
    >
      <button
        type="button"
        className={cn(button, dims)}
        aria-label={`Decrease quantity${of}`}
        aria-disabled={atMin || undefined}
        onClick={() => {
          if (!atMin) onChange(value - 1);
        }}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <output
        aria-live="polite"
        aria-atomic="true"
        className={cn("min-w-8 text-center font-semibold text-jamun-900 tabular-nums", size === "sm" ? "text-base" : "text-lg")}
      >
        <span className="sr-only">{label}: </span>
        {value}
      </output>
      <button
        type="button"
        className={cn(button, dims)}
        aria-label={`Increase quantity${of}`}
        aria-disabled={atMax || undefined}
        onClick={() => {
          if (!atMax) onChange(value + 1);
        }}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
