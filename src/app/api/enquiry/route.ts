import {
  deliveryFormatOptions,
  enquirySchema,
  enquiryTopicOptions,
  optionLabel,
  teamSizeOptions,
} from "@/components/corporate/enquiry-schema";
import { apiError, apiOk, parseBody } from "@/lib/http";
import { recordSubmission, SAVE_FAILED_MESSAGE } from "@/lib/leads";
import { isBot } from "@/lib/validation";

/**
 * Corporate training enquiries from /corporate.
 * Validates, drops honeypot submissions silently, and records an "enquiry".
 */
export async function POST(request: Request) {
  const { data, response } = await parseBody(request, enquirySchema);
  if (response) return response;

  // Bots get a normal-looking success so they don't retry, and nothing is saved.
  if (isBot(data)) return apiOk();

  const result = await recordSubmission("enquiry", {
    source: "corporate-page",
    program: "corporate-training",
    name: data.name,
    email: data.email,
    phone: data.phone,
    organisation: data.organisation,
    role: data.role,
    teamSize: optionLabel(teamSizeOptions, data.teamSize),
    topics: data.topics.map((t) => optionLabel(enquiryTopicOptions, t)).join(", "),
    format: optionLabel(deliveryFormatOptions, data.format),
    message: data.message ?? "",
    consent: data.consent,
  });

  if (!result.ok) return apiError(503, SAVE_FAILED_MESSAGE);
  return apiOk();
}
