"use client";

import { AnimatePresence, motion } from "framer-motion";
import { countdownSentence } from "@/components/enroll/EventCountdown";
import { useNow, useTickAfter } from "@/components/enroll/use-now";
import { cn } from "@/lib/cn";

/**
 * The funnel pages' countdown to the real start time: the same honest clock
 * as <EventCountdown> (days, hours and minutes from the site's shared 30-second
 * tick, never reset, never invented), with digits that roll into place like
 * an odometer when they first appear and each time one changes.
 *
 * Screen readers get one plain sentence and nothing ticking; there is no
 * live region. On the server it reserves its space invisibly (so the hero
 * doesn't jump when it appears) and it disappears once the event starts.
 */

const ROLL = { type: "spring", stiffness: 210, damping: 24, mass: 0.9 } as const;

type Unit = { value: number; label: string };

function plural(n: number, one: string) {
  return n === 1 ? one : `${one}s`;
}

export function RollingCountdown({ startsAt, className }: { startsAt: string; className?: string }) {
  const now = useNow();
  useTickAfter(startsAt);

  const start = new Date(startsAt).getTime();
  if (Number.isNaN(start)) return null;

  if (now === null) {
    // Placeholder with the same footprint until the browser knows the time.
    return (
      <div aria-hidden="true" className={cn("invisible", className)}>
        <Face units={[0, 0, 0].map((value, i) => ({ value, label: ["days", "hours", "minutes"][i] }))} still />
      </div>
    );
  }
  if (start <= now) return null;

  // Round up so the final minute reads "1 minute", never "0 minutes".
  const totalMinutes = Math.ceil((start - now) / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <p className="sr-only">Starts in {countdownSentence(days, hours, minutes)}</p>
      <Face
        units={[
          { value: days, label: plural(days, "day") },
          { value: hours, label: plural(hours, "hour") },
          { value: minutes, label: plural(minutes, "minute") },
        ]}
      />
    </motion.div>
  );
}

function Face({ units, still = false }: { units: Unit[]; still?: boolean }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      <p className="eyebrow text-marigold-700">Starts in</p>
      <div className="flex gap-2">
        {units.map((unit, u) => (
          <div
            key={u}
            className="flex min-w-[4.5rem] flex-col items-center rounded-xl border border-line bg-white px-3 pt-2.5 pb-1.5 shadow-[0_10px_24px_-20px_rgba(42,22,54,0.5)]"
          >
            <span className="flex font-display text-[1.875rem] leading-none text-jamun-900">
              {String(unit.value)
                .padStart(2, "0")
                .split("")
                .map((digit, i, all) => (
                  // Keyed from the right, so "9" → "10" adds a digit on the left instead of reshuffling.
                  <Digit key={all.length - i} digit={digit} still={still} />
                ))}
            </span>
            <span className="mt-1 text-xs font-semibold text-muted">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** One odometer wheel: the new digit rolls down into view as the old one rolls out. */
function Digit({ digit, still }: { digit: string; still: boolean }) {
  const wheel = "relative inline-flex h-[1.1em] w-[0.62em] items-center justify-center overflow-hidden";
  if (still) return <span className={wheel}>{digit}</span>;
  return (
    <span className={wheel}>
      <AnimatePresence initial mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: "-105%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "105%", opacity: 0 }}
          transition={ROLL}
          className="block text-center"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
