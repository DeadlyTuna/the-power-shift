import { z } from "zod";
import { getProgram, isEventOpen } from "@/content/programs";
import { closedMessage } from "@/components/enroll/messages";
import { formatEventTime, formatShortDate } from "@/lib/format";
import { apiError, apiOk, parseBody } from "@/lib/http";
import { recordSubmission, SAVE_FAILED_MESSAGE } from "@/lib/leads";
import { contactBase, isBot } from "@/lib/validation";

/**
 * POST /api/register
 * Free event registration, and the waitlist for any live event whose start
 * time has passed. Paid seats are reserved through /api/checkout/program.
 *
 * Body: { slug, name, email, phone, consent, website, source?, intent?: "register" | "waitlist" }
 * 409 + fields.event when registration has closed (the form switches to the waitlist).
 */

const schema = contactBase.extend({
  slug: z.string().trim().min(1, { error: "Choose a program" }).max(80),
  source: z.string().trim().max(80).optional(),
  intent: z.enum(["register", "waitlist"]).default("register"),
});

export async function POST(request: Request) {
  const { data, response } = await parseBody(request, schema);
  if (response) return response;

  // Bots fill the hidden field; answer as if it worked and record nothing.
  if (isBot(data)) return apiOk({ redirectTo: "/thank-you" });

  const program = getProgram(data.slug);
  if (!program) {
    return apiError(404, "We couldn't find that program. Refresh the page and try again.");
  }
  if (program.mode !== "free" && program.mode !== "paid") {
    return apiError(400, "This program doesn't take event registrations. Use the form on its page instead.");
  }

  // Re-checked at request time: a statically built page can't decide this.
  const open = isEventOpen(program);

  if (data.intent === "register") {
    if (!open) {
      const message = closedMessage(program);
      return apiError(409, message, { event: message });
    }
    if (program.mode === "paid") {
      return apiError(400, "Seats for this workshop are reserved with payment. Use the payment button to continue.");
    }
  }

  const type = data.intent === "waitlist" ? "waitlist" : "registration";
  const saved = await recordSubmission(type, {
    status: type === "waitlist" ? "waitlist" : "registered",
    program: program.slug,
    programTitle: program.title,
    mode: program.mode,
    eventStartsAt: program.event?.startsAt ?? "",
    eventDate: program.event
      ? `${formatShortDate(program.event.startsAt)}, ${formatEventTime(program.event.startsAt)}`
      : "",
    name: data.name,
    email: data.email,
    phone: data.phone,
    consent: data.consent,
    source: data.source ?? "",
  });
  if (!saved.ok) return apiError(503, SAVE_FAILED_MESSAGE);

  return apiOk(
    type === "waitlist" ? { waitlist: true } : { redirectTo: `/thank-you?program=${encodeURIComponent(program.slug)}` },
  );
}
