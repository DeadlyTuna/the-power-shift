import assert from "node:assert/strict";
import { test } from "node:test";
import { getProgram, programs } from "@/content/programs";
import { buildIcs, escapeText, foldLine, googleCalendarUrl, utcStamp } from "./calendar";

const encoder = new TextEncoder();

test("utcStamp uses the iCalendar UTC form", () => {
  assert.equal(utcStamp(new Date("2026-05-22T18:00:00+05:30")), "20260522T123000Z");
});

test("escapeText escapes backslashes, semicolons, commas and newlines", () => {
  assert.equal(escapeText("a\\b;c,d\ne"), "a\\\\b\\;c\\,d\\ne");
});

test("foldLine keeps every physical line within 75 octets without splitting characters", () => {
  const line = `DESCRIPTION:${"₹9 seat, Hindi / English. ".repeat(12)}`;
  const folded = foldLine(line);
  const physical = folded.split("\r\n");
  assert.ok(physical.length > 1);
  for (const [i, part] of physical.entries()) {
    assert.ok(encoder.encode(part).length <= 75, `line ${i} is ${encoder.encode(part).length} octets`);
    if (i > 0) assert.ok(part.startsWith(" "));
  }
  // Unfolding (RFC 5545 §3.1) restores the original line exactly.
  assert.equal(folded.replace(/\r\n /g, ""), line);
});

test("buildIcs produces a CRLF calendar with UTC start and end from the program", () => {
  const program = getProgram("leadership-confidence-workshop");
  assert.ok(program);
  const ics = buildIcs(program, new Date("2026-05-01T00:00:00Z"));
  assert.ok(ics);
  assert.ok(ics.endsWith("\r\n"));
  assert.ok(!/[^\r]\n/.test(ics), "every line break is CRLF");
  const unfolded = ics.replace(/\r\n /g, "");
  // Expected window derived from content, so the test survives date changes.
  const startsAt = new Date(program.event!.startsAt);
  const start = utcStamp(startsAt);
  const end = utcStamp(new Date(startsAt.getTime() + program.event!.durationMinutes * 60_000));
  assert.ok(unfolded.includes(`\r\nDTSTART:${start}\r\n`));
  assert.ok(unfolded.includes(`\r\nDTEND:${end}\r\n`));
  assert.match(unfolded, /\r\nDTSTAMP:20260501T000000Z\r\n/);
  assert.ok(unfolded.includes(`\r\nUID:leadership-confidence-workshop-${start}@`));
  assert.match(unfolded, /\r\nDESCRIPTION:.*joining link is shared in the WhatsApp community/);
  assert.match(unfolded, /\r\nURL:https?:\/\/[^\r]+\/leadership-workshop\r\n/);
  for (const line of ics.split("\r\n")) assert.ok(encoder.encode(line).length <= 75);
});

test("programs without an event have no calendar exports", () => {
  for (const program of programs.filter((p) => !p.event)) {
    assert.equal(buildIcs(program), null);
    assert.equal(googleCalendarUrl(program), null);
  }
});

test("googleCalendarUrl carries the event window in UTC", () => {
  const program = getProgram("be-heard-masterclass");
  assert.ok(program);
  const url = new URL(googleCalendarUrl(program) ?? "");
  assert.equal(url.hostname, "calendar.google.com");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  const startsAt = new Date(program!.event!.startsAt);
  const endsAt = new Date(startsAt.getTime() + program!.event!.durationMinutes * 60_000);
  assert.equal(url.searchParams.get("dates"), `${utcStamp(startsAt)}/${utcStamp(endsAt)}`);
});
