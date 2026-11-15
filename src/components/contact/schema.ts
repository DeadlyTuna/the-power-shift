import { z } from "zod";
import { site } from "@/content/site";
import { consentField, emailField, honeypotField, nameField, phoneField } from "@/lib/validation";

/**
 * Contact form contract, shared by the form (topic options, limits) and
 * POST /api/contact (validation). No "use client": safe to import from both.
 */

export const CONTACT_TOPICS = ["programs", "corporate", "merch", "other"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const contactTopicLabels: Record<ContactTopic, string> = {
  programs: "Programs & coaching",
  corporate: "Corporate training",
  merch: "Merch order",
  other: "Something else",
};

export const contactTopicOptions = CONTACT_TOPICS.map((value) => ({ value, label: contactTopicLabels[value] }));

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;

/** Recorded with each submission so there's a record of exactly what the person agreed to. */
export const CONTACT_CONSENT_TEXT = `I agree that ${site.brand} can use these details to reply to my message, as described in the privacy policy.`;

export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  /** Optional: an empty field is treated as "not given". */
  phone: z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), phoneField.optional()),
  topic: z.enum(CONTACT_TOPICS, { error: "Choose what your message is about" }),
  message: z
    .string({ error: "Write your message" })
    .trim()
    .min(MESSAGE_MIN, { error: `Tell us a little more: at least ${MESSAGE_MIN} characters` })
    .max(MESSAGE_MAX, { error: `Keep your message under ${MESSAGE_MAX.toLocaleString("en-IN")} characters` }),
  consent: consentField,
  website: honeypotField,
});

export type ContactInput = z.input<typeof contactSchema>;
