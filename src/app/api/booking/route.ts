import {
  bookingSchema,
  bookingTopicOptions,
  optionLabel,
  preferredTimeOptions,
} from "@/components/booking/booking-schema";
import { apiError, apiOk, parseBody } from "@/lib/http";
import { recordSubmission, SAVE_FAILED_MESSAGE } from "@/lib/leads";
import { isBot } from "@/lib/validation";

/**
 * Clarity-call requests from /book (used when no booking calendar is configured).
 * Validates, drops honeypot submissions silently, and records a "booking-request".
 * Manisha's team confirms a time on WhatsApp.
 */
export async function POST(request: Request) {
  const { data, response } = await parseBody(request, bookingSchema);
  if (response) return response;

  // Bots get a normal-looking success so they don't retry, and nothing is saved.
  if (isBot(data)) return apiOk();

  const result = await recordSubmission("booking-request", {
    source: "book-page",
    name: data.name,
    email: data.email,
    whatsapp: data.phone,
    topic: optionLabel(bookingTopicOptions, data.topic),
    preferredTime: optionLabel(preferredTimeOptions, data.preferredTime),
    note: data.note ?? "",
    consent: data.consent,
  });

  if (!result.ok) return apiError(503, SAVE_FAILED_MESSAGE);
  return apiOk();
}
