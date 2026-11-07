"use client";

import { NumberTicker } from "@/components/kit/number-ticker";
import { useMotionOK } from "@/components/funnel/use-motion-ok";
import { cn } from "@/lib/cn";

/**
 * A real number from content ("20+", "8+") that counts up the first time it
 * scrolls into view. Prefixes and suffixes stay put; only the digits move.
 *
 * Screen readers get the final value once (the ticking copy is hidden from
 * them). On the server, without JavaScript and with reduced motion, the
 * final value is shown as plain text.
 */
export function TickedNumber({ value, delay = 0, className }: { value: string; delay?: number; className?: string }) {
  const animate = useMotionOK();
  const match = value.match(/^(\D*)(\d+)(\D*)$/);

  if (!animate || !match) return <span className={className}>{value}</span>;

  const [, prefix, digits, suffix] = match;
  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {prefix}
        <NumberTicker value={Number(digits)} delay={delay} className={cn("tracking-normal text-current")} />
        {suffix}
      </span>
    </span>
  );
}
