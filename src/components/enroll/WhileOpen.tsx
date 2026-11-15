"use client";

import type { ReactNode } from "react";
import { useEventStatus } from "./use-now";

/**
 * Shows its children only while a live event is still open for registration,
 * e.g. payment and guarantee notes that stop applying once the form has
 * switched to the waitlist. Decided in the browser after mount; the server
 * render (and programs without a date) show the children.
 */
export function WhileOpen({ startsAt, children }: { startsAt?: string; children: ReactNode }) {
  const status = useEventStatus(startsAt);
  return status === "closed" ? null : <>{children}</>;
}
