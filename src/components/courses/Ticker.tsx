import { NumberTicker } from "@/components/kit/number-ticker";
import { cn } from "@/lib/cn";

/**
 * NumberTicker for real figures from content (lesson counts, minutes, years).
 * Screen readers and visitors without JavaScript get the final number; the
 * ticking copy is visual only.
 */
export function Ticker({ value, className, delay }: { value: number; className?: string; delay?: number }) {
  return (
    <span className={cn("tabular-nums", className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="hidden [html:not(.js)_&]:inline">
        {value}
      </span>
      <NumberTicker
        aria-hidden="true"
        value={value}
        delay={delay}
        className="tracking-normal text-inherit [html:not(.js)_&]:hidden"
      />
    </span>
  );
}
