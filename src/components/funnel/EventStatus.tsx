"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Program } from "@/content/programs";
import { useEventOpenOr } from "@/components/enroll/use-now";

/**
 * Whether a landing page's live event is still open for registration.
 *
 * The page computes `serverOpen` at render time (it revalidates every few
 * minutes). React uses that value while hydrating, so server HTML and the
 * first client render always agree; it then re-checks against the visitor's
 * clock and flips to the waitlist state on its own when the event starts,
 * even if the page was served from a stale cache or left open in a tab.
 *
 * It reads the site's shared clock (src/components/enroll/use-now.ts), the
 * same one the registration form and countdown use, so the page and its form
 * always switch together.
 */

const EventOpenContext = createContext<boolean | null>(null);

export function EventStatusProvider({
  program,
  serverOpen,
  children,
}: {
  program: Program;
  serverOpen: boolean;
  children: ReactNode;
}) {
  const open = useEventOpenOr(program.event?.startsAt, serverOpen);
  return <EventOpenContext.Provider value={open}>{children}</EventOpenContext.Provider>;
}

/** True while registration is open. Must be used inside <EventStatusProvider>. */
export function useEventOpen(): boolean {
  const open = useContext(EventOpenContext);
  if (open === null) throw new Error("useEventOpen must be used inside <EventStatusProvider>");
  return open;
}

/** Renders `open` while registration is open and `closed` once the event has started. */
export function EventSwitch({ open, closed = null }: { open: ReactNode; closed?: ReactNode }) {
  return <>{useEventOpen() ? open : closed}</>;
}
