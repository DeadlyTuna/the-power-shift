import { z } from "zod";
import { statements } from "@/content/assessment";
import { getProgram } from "@/content/programs";
import { apiError, apiOk, parseBody } from "@/lib/http";
import { SAVE_FAILED_MESSAGE, recordSubmission } from "@/lib/leads";
import { consentField, emailField, honeypotField, isBot, nameField, phoneField } from "@/lib/validation";
import { answersSchema, computeResult, focusIdSchema, MAX_TOTAL } from "@/lib/assessment/scoring";

/**
 * "Email me my results" from the Power Self-Assessment.
 *
 * The browser sends the raw answers and the chosen focus statement; the
 * score, band, patterns and recommendation are recomputed here from
 * src/content/assessment.ts, never taken from the request.
 */

const schema = z.object({
  answers: answersSchema,
  focusId: focusIdSchema,
  name: nameField,
  email: emailField,
  /** WhatsApp number is optional: blank means "not given". */
  phone: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    phoneField.optional(),
  ),
  consent: consentField,
  website: honeypotField,
});

export async function POST(request: Request) {
  const { data, response } = await parseBody(request, schema);
  if (response) return response;

  // Bots get a normal-looking success and nothing is recorded.
  if (isBot(data)) return apiOk();

  let result: ReturnType<typeof computeResult>;
  try {
    result = computeResult(data.answers, data.focusId ?? null);
  } catch {
    return apiError(422, "Your answers look incomplete. Please retake the assessment and try again.");
  }

  const program = getProgram(result.recommendedProgramSlug);

  const saved = await recordSubmission("assessment", {
    source: "assessment",
    name: data.name,
    email: data.email,
    phone: data.phone ?? "",
    consent: true,
    total: result.total,
    maxTotal: MAX_TOTAL,
    powerScore: result.powerScore,
    band: result.band.title,
    bandId: result.band.id,
    patterns: result.patterns.map((p) => ({
      id: p.pattern.id,
      name: p.pattern.name,
      score: p.score,
      outOf: p.statementIds.length * 2,
      level: p.level,
    })),
    patternScores: result.patterns.map((p) => `${p.pattern.name}: ${p.score}/${p.statementIds.length * 2}`).join("; "),
    dominant: result.dominant.map((p) => p.name).join(", "),
    focusStatement: result.focus?.text ?? "",
    focusShift: result.focus?.shift ?? "",
    recommendedProgram: result.recommendedProgramSlug,
    recommendedProgramTitle: program?.title ?? "",
    answers: statements.map((s) => `${s.id}:${data.answers[s.id]}`).join(" "),
  });

  if (!saved.ok) return apiError(503, SAVE_FAILED_MESSAGE);

  return apiOk({ band: result.band.id });
}
