"use client";

import type { ReactNode } from "react";
import { useEventOpenOr } from "@/components/enroll/use-now";
import { Badge } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";

/**
 * Whether an event is still open for registration, decided in the browser on
 * the site's shared clock (src/components/enroll/use-now.ts), so these labels
 * flip at the same moment as the enrollment form and the countdown.
 *
 * On the server (and during hydration) it returns `serverGuess`: null when the
 * caller has no fresh server time (the card renders nothing), or the page's
 * own isEventOpen() result on pages that revalidate. The browser then checks
 * the real clock, so a page can never get stuck saying "open" after an event
 * has started.
 */
export function useEventOpen(startsAt: string, serverGuess: boolean | null = null): boolean | null {
  return useEventOpenOr(startsAt, serverGuess);
}

/** "Registration open" / "Waitlist open". Renders nothing until the browser knows. */
export function EventStatus({
  startsAt,
  serverGuess = null,
  className,
}: {
  startsAt: string;
  serverGuess?: boolean | null;
  className?: string;
}) {
  const open = useEventOpen(startsAt, serverGuess);
  if (open === null) return null;
  return (
    <Badge tone={open ? "peacock" : "marigold"} className={cn("shrink-0", className)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", open ? "bg-peacock-600" : "bg-marigold-700")} />
      {open ? "Registration open" : "Waitlist open"}
    </Badge>
  );
}

/** Text that depends on whether the event is open. `pending` shows until the browser knows. */
export function EventAwareText({
  startsAt,
  serverGuess = null,
  open,
  closed,
  pending,
}: {
  startsAt: string;
  serverGuess?: boolean | null;
  open: string;
  closed: string;
  pending?: string;
}) {
  const state = useEventOpen(startsAt, serverGuess);
  if (state === null) return <>{pending ?? open}</>;
  return <>{state ? open : closed}</>;
}

/** Renders `children` only once the browser has confirmed the event is closed. */
export function WhenEventClosed({
  startsAt,
  serverGuess = null,
  children,
}: {
  startsAt: string;
  serverGuess?: boolean | null;
  children: ReactNode;
}) {
  const state = useEventOpen(startsAt, serverGuess);
  return state === false ? <>{children}</> : null;
}
