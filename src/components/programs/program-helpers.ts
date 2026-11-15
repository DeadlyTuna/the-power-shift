import type { EnrollMode, Program } from "@/content/programs";
import { patterns, statements, type Pattern, type Statement } from "@/content/assessment";
import { testimonials, type Testimonial } from "@/content/testimonials";
import { formatEventDate, formatEventTime, formatINR } from "@/lib/format";

/**
 * Presentation helpers shared by the program card, the catalog and the
 * detail pages. They only derive labels from src/content; no facts live here.
 */

/** Where a program's main page lives: its long-form landing page when it has one. */
export function programHref(program: Program): string {
  return program.landingPath ?? `/programs/${program.slug}`;
}

/** The short price label shown on cards and in the detail hero. Null when there is nothing honest to show. */
export function priceLabel(program: Program): string | null {
  switch (program.mode) {
    case "free":
      return "Free";
    case "paid":
      return program.price ? formatINR(program.price.amount) : null;
    case "application":
      return "By application";
    case "enquiry":
      return "Custom proposal";
  }
}

/** Whether the price label is a figure ("Free", "₹9") rather than a phrase ("By application"). */
export function priceIsFigure(program: Program): boolean {
  return program.mode === "free" || program.mode === "paid";
}

/**
 * Labels for the call to action that takes a visitor to the enrollment form.
 * Events switch to the waitlist once they have started; the switch happens in
 * the browser (see EventState) so it never freezes at build time.
 */
export function enrollCtaLabels(program: Program): { open: string; closed: string } {
  switch (program.mode) {
    case "free":
      return { open: "Reserve my free seat", closed: "Join the waitlist" };
    case "paid":
      return {
        open: program.price ? `Reserve my seat for ${formatINR(program.price.amount)}` : "Reserve my seat",
        closed: "Join the waitlist",
      };
    case "application":
      return { open: "Start my application", closed: "Start my application" };
    case "enquiry":
      return { open: "Send an enquiry", closed: "Send an enquiry" };
  }
}

/** Heading for the enrollment section. */
export function enrollHeadings(program: Program): { open: string; closed: string } {
  switch (program.mode) {
    case "free":
      return { open: "Reserve your free seat", closed: "Join the waitlist for the next session" };
    case "paid":
      return { open: "Reserve your seat", closed: "Join the waitlist for the next workshop" };
    case "application":
      return { open: "Start with a free clarity call", closed: "Start with a free clarity call" };
    case "enquiry":
      return { open: "Tell us about your team", closed: "Tell us about your team" };
  }
}

/** The card's call to action: what the visitor will find on the next page. */
export function cardCtaLabel(mode: EnrollMode): string {
  switch (mode) {
    case "free":
    case "paid":
      return "See the details";
    case "application":
      return "See how it works";
    case "enquiry":
      return "See options for your team";
  }
}

/** "Friday, 8 May 2026 · 6:00 PM IST" */
export function eventWhen(program: Program): string | null {
  if (!program.event) return null;
  return `${formatEventDate(program.event.startsAt)} · ${formatEventTime(program.event.startsAt)}`;
}

/** Look up a format fact by its label, e.g. formatValue(program, "Language"). */
export function formatValue(program: Program, label: string): string | undefined {
  return program.format.find((f) => f.label === label)?.value;
}

/** The pattern a program primarily works on, with one of its scripts for the signature reframe. */
export function primaryPattern(program: Program): { pattern: Pattern; statement: Statement } | null {
  const id = program.addresses[0];
  const pattern = patterns.find((p) => p.id === id);
  const statement = statements.find((s) => s.pattern === id);
  return pattern && statement ? { pattern, statement } : null;
}

/** The client stories shown beside a program (program.testimonialIds in src/content/programs.ts). */
export function testimonialsFor(program: Program): Testimonial[] {
  const ids = program.testimonialIds;
  if (!ids) return testimonials;
  return ids.map((id) => testimonials.find((t) => t.id === id)).filter((t): t is Testimonial => Boolean(t));
}

/** "Germany, China and Korea" */
export function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
