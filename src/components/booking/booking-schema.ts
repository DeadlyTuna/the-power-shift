import { z } from "zod";
import { contactBase } from "@/lib/validation";

/**
 * The clarity-call request form's options and validation, shared by the form
 * (inline errors before sending) and POST /api/booking (the real check).
 */

type Option = { value: string; label: string };

export const bookingTopicOptions = [
  { value: "leadership", label: "Leadership & career growth" },
  { value: "confidence", label: "Confidence & mindset" },
  { value: "relationships", label: "Relationships & being heard" },
  { value: "corporate", label: "Corporate training for my team" },
  { value: "other", label: "Something else" },
] as const satisfies readonly Option[];

export const preferredTimeOptions = [
  { value: "weekday-morning", label: "Weekday morning" },
  { value: "weekday-afternoon", label: "Weekday afternoon" },
  { value: "weekday-evening", label: "Weekday evening" },
  { value: "weekend", label: "Weekend" },
] as const satisfies readonly Option[];

type Values<T extends readonly Option[]> = T[number]["value"];

function values<T extends readonly Option[]>(options: T) {
  return options.map((o) => o.value) as [Values<T>, ...Values<T>[]];
}

/** Human-readable label for a stored option value. */
export function optionLabel(options: readonly Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export const bookingSchema = contactBase.extend({
  topic: z.enum(values(bookingTopicOptions), { error: "Choose what you'd like help with" }),
  preferredTime: z.enum(values(preferredTimeOptions), { error: "Choose a time that usually suits you" }),
  note: z.string().trim().max(1000, { error: "Keep your note under 1,000 characters" }).optional(),
});

export type BookingRequest = z.output<typeof bookingSchema>;
