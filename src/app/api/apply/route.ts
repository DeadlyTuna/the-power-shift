import { z } from "zod";
import { getProgram } from "@/content/programs";
import { HEARD_FROM } from "@/components/enroll/options";
import { apiError, apiOk, parseBody } from "@/lib/http";
import { recordSubmission, SAVE_FAILED_MESSAGE } from "@/lib/leads";
import { contactBase, isBot } from "@/lib/validation";

/**
 * POST /api/apply
 * Applications for ongoing programs (mode "application"), followed up with a
 * clarity call by Manisha's team.
 *
 * Body: { slug, name, email, phone, role, change, heardFrom?, consent, website, source? }
 */

const schema = contactBase.extend({
  slug: z.string({ error: "Choose a program" }).trim().min(1, { error: "Choose a program" }).max(80),
  role: z
    .string({ error: "Tell us your current role, for example Team lead" })
    .trim()
    .min(2, { error: "Tell us your current role, for example Team lead" })
    .max(120, { error: "Use 120 characters or fewer" }),
  change: z
    .string({ error: "Tell us in a few words what you'd like to change" })
    .trim()
    .min(5, { error: "Tell us in a few words what you'd like to change" })
    .max(2000, { error: "Use 2,000 characters or fewer" }),
  heardFrom: z
    .enum([...HEARD_FROM, ""], { error: "Choose one of the listed options" })
    .optional()
    .transform((value) => value || undefined),
  source: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  const { data, response } = await parseBody(request, schema);
  if (response) return response;

  // Bots fill the hidden field; answer as if it worked and record nothing.
  if (isBot(data)) return apiOk();

  const program = getProgram(data.slug);
  if (!program) {
    return apiError(404, "We couldn't find that program. Refresh the page and try again.");
  }
  if (program.mode !== "application") {
    return apiError(400, "This program doesn't take applications. Use the form on its page instead.");
  }

  const saved = await recordSubmission("application", {
    status: "new",
    program: program.slug,
    programTitle: program.title,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    change: data.change,
    heardFrom: data.heardFrom ?? "",
    consent: data.consent,
    source: data.source ?? "",
  });
  if (!saved.ok) return apiError(503, SAVE_FAILED_MESSAGE);

  return apiOk();
}
