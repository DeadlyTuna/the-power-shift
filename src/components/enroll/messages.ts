import type { Program } from "@/content/programs";
import { formatShortDate } from "@/lib/format";

/** Copy shared by the enrollment forms and API routes, so the browser and server say the same thing. */

export function closedHeadline(program: Program): string {
  return program.event
    ? `Registrations for the ${formatShortDate(program.event.startsAt)} session have closed.`
    : "Registrations for this session have closed.";
}

export const WAITLIST_INVITE = "Join the waitlist and we'll let you know as soon as the next date opens.";

export function closedMessage(program: Program): string {
  return `${closedHeadline(program)} ${WAITLIST_INVITE}`;
}
