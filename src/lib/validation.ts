import { z } from "zod";

/**
 * Shared form schemas. Used on the server to validate every submission and
 * on the client for inline errors, so both sides agree on the rules.
 */

/** Normalise Indian mobile numbers to +91XXXXXXXXXX; keep other international numbers as +<digits>. */
export function normalizePhone(raw: string): string {
  const compact = raw.replace(/[\s\-().]/g, "");
  const indian = compact.match(/^(?:\+?91|0)?([6-9]\d{9})$/);
  if (indian) return `+91${indian[1]}`;
  return compact.startsWith("+") ? compact : `+${compact}`;
}

export function isValidPhone(raw: string): boolean {
  const compact = raw.replace(/[\s\-().]/g, "");
  return /^(?:\+?91|0)?[6-9]\d{9}$/.test(compact) || /^\+[1-9]\d{7,14}$/.test(compact);
}

export const nameField = z
  .string({ error: "Enter your name" })
  .trim()
  .min(2, { error: "Enter your name" })
  .max(80, { error: "Use 80 characters or fewer" });

export const emailField = z
  .string({ error: "Enter a valid email address, like name@example.com" })
  .trim()
  .toLowerCase()
  .max(254, { error: "Enter a shorter email address" })
  .pipe(z.email({ error: "Enter a valid email address, like name@example.com" }));

export const phoneField = z
  .string({ error: "Enter a valid mobile number, like 98765 43210" })
  .trim()
  .refine(isValidPhone, { error: "Enter a valid mobile number, like 98765 43210" })
  .transform(normalizePhone);

export const consentField = z.literal(true, {
  error: "Please agree so we can contact you about this",
});

/** Hidden honeypot input. Real people never fill it; bots usually do. */
export const honeypotField = z.string().max(500).optional();

export const contactBase = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  consent: consentField,
  website: honeypotField,
});

export type ContactBase = z.infer<typeof contactBase>;

/** Flatten zod issues into { field: message } for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** True when the honeypot was filled in, i.e. the submission is almost certainly a bot. */
export function isBot(data: { website?: string | undefined }): boolean {
  return Boolean(data.website && data.website.trim().length > 0);
}
