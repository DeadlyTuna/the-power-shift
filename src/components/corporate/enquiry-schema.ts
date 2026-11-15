import { z } from "zod";
import { contactBase } from "@/lib/validation";

/**
 * The corporate enquiry form's options and validation, shared by the form
 * (inline errors before sending) and POST /api/enquiry (the real check).
 */

type Option = { value: string; label: string };

export const teamSizeOptions = [
  { value: "under-20", label: "Under 20" },
  { value: "20-50", label: "20–50" },
  { value: "50-200", label: "50–200" },
  { value: "200-plus", label: "200+" },
] as const satisfies readonly Option[];

export const enquiryTopicOptions = [
  { value: "leadership", label: "Leadership" },
  { value: "resilience", label: "Resilience" },
  { value: "emotional-intelligence", label: "Emotional intelligence" },
  { value: "communication", label: "Communication" },
  { value: "power-n", label: "Power*N for women's networks" },
] as const satisfies readonly Option[];

export const deliveryFormatOptions = [
  { value: "in-person", label: "In person" },
  { value: "virtual", label: "Virtual" },
  { value: "either", label: "Either" },
] as const satisfies readonly Option[];

type Values<T extends readonly Option[]> = T[number]["value"];

function values<T extends readonly Option[]>(options: T) {
  return options.map((o) => o.value) as [Values<T>, ...Values<T>[]];
}

/** Human-readable label for a stored option value. */
export function optionLabel(options: readonly Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export const enquirySchema = contactBase.extend({
  organisation: z
    .string({ error: "Enter your organisation's name" })
    .trim()
    .min(2, { error: "Enter your organisation's name" })
    .max(120, { error: "Use 120 characters or fewer" }),
  role: z
    .string({ error: "Enter your role, for example L&D Manager" })
    .trim()
    .min(2, { error: "Enter your role, for example L&D Manager" })
    .max(80, { error: "Use 80 characters or fewer" }),
  teamSize: z.enum(values(teamSizeOptions), { error: "Choose roughly how many people this is for" }),
  topics: z
    .array(z.enum(values(enquiryTopicOptions), { error: "Choose topics from the list" }))
    .max(enquiryTopicOptions.length)
    .default([]),
  format: z.enum(values(deliveryFormatOptions), { error: "Choose in person, virtual or either" }),
  message: z.string().trim().max(2000, { error: "Keep your message under 2,000 characters" }).optional(),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;
