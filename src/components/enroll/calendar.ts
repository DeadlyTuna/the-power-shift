import type { Program } from "@/content/programs";
import { absoluteUrl, site } from "@/content/site";
import { formatDuration } from "@/lib/format";

/**
 * Calendar exports for live events: an RFC 5545 .ics file (served by
 * /api/calendar/[slug]) and a Google Calendar template link. Both carry only
 * program details, never anything about the person who registered.
 */

export type CalendarEvent = {
  uid: string;
  start: Date;
  end: Date;
  title: string;
  description: string;
  location: string;
  url: string;
};

/** 2026-05-08T12:30:00.000Z → "20260508T123000Z" (iCalendar / Google UTC form). */
export function utcStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/[-:]/g, "");
}

export function calendarEvent(program: Program): CalendarEvent | null {
  const event = program.event;
  if (!event) return null;
  const start = new Date(event.startsAt);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + event.durationMinutes * 60_000);
  const url = absoluteUrl(program.landingPath ?? `/programs/${program.slug}`);

  const joining = site.whatsappCommunityUrl
    ? `The joining link is shared in the WhatsApp community: ${site.whatsappCommunityUrl}`
    : `The joining link is shared in the WhatsApp community. Not in it yet? Message ${site.contact.phoneDisplay} on WhatsApp.`;

  const description = [
    `Live on ${event.platform} with ${site.coach}. ${formatDuration(event.durationMinutes)}, in ${event.language}.`,
    joining,
    `Details: ${url}`,
  ].join("\n\n");

  return {
    uid: `${program.slug}-${utcStamp(start)}@${site.domain}`,
    start,
    end,
    title: program.title,
    description,
    location: `Online (${event.platform})`,
    url,
  };
}

/** Escape a TEXT value (RFC 5545 §3.3.11). */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

const encoder = new TextEncoder();

/**
 * Fold a content line so no physical line exceeds 75 octets (RFC 5545 §3.1).
 * Continuation lines start with a single space, which counts towards their
 * 75 octets. Splits only between code points, so multi-byte characters such
 * as ₹ are never broken.
 */
export function foldLine(line: string): string {
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  let limit = 75;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > limit) {
      out.push(current);
      current = char;
      bytes = size;
      limit = 74;
    } else {
      current += char;
      bytes += size;
    }
  }
  out.push(current);
  return out.join("\r\n ");
}

export function buildIcs(program: Program, now: Date = new Date()): string | null {
  const event = calendarEvent(program);
  if (!event) return null;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${site.brand}//Enrollment//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${utcStamp(event.start)}`,
    `DTEND:${utcStamp(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    `URL:${event.url}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(`${program.shortTitle} starts in 15 minutes`)}`,
    "TRIGGER:-PT15M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

/** "Add to Google Calendar" template link. Contains program details only. */
export function googleCalendarUrl(program: Program): string | null {
  const event = calendarEvent(program);
  if (!event) return null;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${utcStamp(event.start)}/${utcStamp(event.end)}`,
    details: event.description,
    location: event.location,
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
