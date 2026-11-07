"use client";

import { cn } from "@/lib/cn";
import { useNow, useTickAfter } from "./use-now";

/**
 * An honest countdown to the real start time of a live event: days, hours
 * and minutes, refreshed every 30 seconds. It never resets and never invents
 * a deadline. Renders nothing on the server (so a static page can't freeze a
 * stale number) and nothing once the start time has passed.
 *
 * Screen readers get one plain sentence instead of ticking digits, and there
 * is deliberately no aria-live region, so nothing is re-announced every tick.
 */
export type EventCountdownProps = {
  /** ISO start time, e.g. program.event.startsAt */
  startsAt: string;
  tone?: "light" | "dark";
  className?: string;
};

function plural(n: number, unit: string) {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

/** "3 days and 4 hours", "2 hours and 5 minutes", "45 minutes". */
export function countdownSentence(days: number, hours: number, minutes: number): string {
  if (days > 0) return hours > 0 ? `${plural(days, "day")} and ${plural(hours, "hour")}` : plural(days, "day");
  if (hours > 0) return minutes > 0 ? `${plural(hours, "hour")} and ${plural(minutes, "minute")}` : plural(hours, "hour");
  return plural(Math.max(minutes, 1), "minute");
}

export function EventCountdown({ startsAt, tone = "light", className }: EventCountdownProps) {
  const now = useNow();
  // Disappear the moment the event starts, together with the page's other open/closed switches.
  useTickAfter(startsAt);
  if (now === null) return null;

  const start = new Date(startsAt).getTime();
  if (Number.isNaN(start) || start <= now) return null;

  // Round up so the final minute reads "1 minute", never "0 minutes".
  const totalMinutes = Math.ceil((start - now) / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const dark = tone === "dark";
  const units = [
    { value: days, label: days === 1 ? "day" : "days" },
    { value: hours, label: hours === 1 ? "hour" : "hours" },
    { value: minutes, label: minutes === 1 ? "minute" : "minutes" },
  ];

  return (
    <div className={cn("inline-flex flex-col gap-2", className)}>
      <p className="sr-only">Starts in {countdownSentence(days, hours, minutes)}</p>
      <p aria-hidden="true" className={cn("eyebrow", dark ? "text-marigold-300" : "text-marigold-700")}>
        Starts in
      </p>
      <div aria-hidden="true" className="flex gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            className={cn(
              "flex min-w-[4.25rem] flex-col items-center rounded-xl border px-3 pt-2 pb-1.5",
              dark ? "border-white/15 bg-white/[0.06]" : "border-line bg-white",
            )}
          >
            <span
              className={cn(
                "font-display text-[1.75rem] leading-none tabular-nums",
                dark ? "text-white" : "text-jamun-900",
              )}
            >
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className={cn("mt-1 text-xs font-semibold", dark ? "text-jamun-200" : "text-muted")}>
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
