import { apiError, apiOk, parseBody } from "@/lib/http";
import { recordSubmission, SAVE_FAILED_MESSAGE } from "@/lib/leads";
import { isBot } from "@/lib/validation";
import { CONTACT_CONSENT_TEXT, contactSchema, contactTopicLabels } from "@/components/contact/schema";

/**
 * POST /api/contact
 * Body: { name, email, phone?, topic, message, consent: true, website (honeypot) }
 * Records a "contact" submission. Responds { ok: true } or an ApiError with
 * per-field messages for the form.
 */
export async function POST(request: Request) {
  const { data, response } = await parseBody(request, contactSchema);
  if (response) return response;

  // Bots get a normal-looking success so they don't retry, but nothing is recorded.
  if (isBot(data)) return apiOk();

  const result = await recordSubmission("contact", {
    name: data.name,
    email: data.email,
    phone: data.phone ?? "",
    topic: contactTopicLabels[data.topic],
    message: data.message,
    consent: true,
    consentText: CONTACT_CONSENT_TEXT,
    page: "/contact",
  });
  if (!result.ok) return apiError(503, SAVE_FAILED_MESSAGE);

  return apiOk();
}
