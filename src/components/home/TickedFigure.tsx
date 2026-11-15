import { NumberTicker } from "@/components/kit/number-ticker";

/**
 * A real figure from the content (e.g. credentials.corporateYears = "20+")
 * that counts up the first time it scrolls into view.
 *
 * - Screen readers get the plain value once (sr-only), never the count.
 * - Without JavaScript, or with reduced motion, the final number is shown
 *   as plain text instead of the counter.
 *
 * Only for verified numbers; never for prices.
 */
export function TickedFigure({
  value,
  suffix = "",
  srText,
  delay = 0,
  className,
}: {
  /** The figure as written in the content, e.g. "20+" or "12". */
  value: string;
  /** Visible text after the number, e.g. " years". */
  suffix?: string;
  /** What screen readers hear instead, e.g. "20+ years". Defaults to value + suffix. */
  srText?: string;
  delay?: number;
  className?: string;
}) {
  const match = /^(\d+)(.*)$/.exec(value);
  if (!match) return <span className={className}>{`${value}${suffix}`}</span>;

  const [, digits, trailing] = match;
  const target = Number(digits);

  return (
    <span className={className}>
      <span className="sr-only">{srText ?? `${value}${suffix}`}</span>
      <span aria-hidden="true">
        {/* Reserve the final width so the words after it don't shift while it counts. */}
        <NumberTicker
          value={target}
          delay={delay}
          style={{ minWidth: `${digits.length}ch` }}
          className="text-right tracking-normal text-inherit motion-reduce:hidden [html:not(.js)_&]:hidden"
        />
        <span className="hidden tabular-nums motion-reduce:inline [html:not(.js)_&]:inline">{digits}</span>
        {trailing}
        {suffix}
      </span>
    </span>
  );
}
