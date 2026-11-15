import { z } from "zod";
import { emailField, honeypotField, nameField, phoneField } from "@/lib/validation";
import { INDIAN_REGIONS } from "./india";
import { MAX_CART_LINES } from "./pricing";

/**
 * Checkout request schema. The checkout page validates with it before
 * sending (for instant inline errors) and the API validates again.
 * Line contents are only shape-checked here; priceCart() decides whether
 * products, variants and quantities are valid.
 */

export const indianMobileField = phoneField.refine((v) => /^\+91[6-9]\d{9}$/.test(v), {
  error: "Enter a 10-digit Indian mobile number, like 98765 43210",
});

export const pinCodeField = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, { error: "Enter a 6-digit PIN code that doesn't start with 0, like 560001" });

export const addressSchema = z.object({
  line1: z
    .string({ error: "Enter your house or flat number and street" })
    .trim()
    .min(3, { error: "Enter your house or flat number and street" })
    .max(120, { error: "Use 120 characters or fewer" }),
  line2: z.string().trim().max(120, { error: "Use 120 characters or fewer" }).optional().default(""),
  city: z
    .string({ error: "Enter your town or city" })
    .trim()
    .min(2, { error: "Enter your town or city" })
    .max(60, { error: "Use 60 characters or fewer" }),
  state: z.enum(INDIAN_REGIONS, { error: "Choose your state or union territory" }),
  pin: pinCodeField,
});

export const customerSchema = z.object({
  name: nameField,
  email: emailField,
  phone: indianMobileField,
});

export const checkoutLineSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  variant: z.string().trim().max(20).optional(),
  qty: z.number().finite(),
});

export const merchCheckoutSchema = z.object({
  customer: customerSchema,
  address: addressSchema,
  lines: z
    .array(checkoutLineSchema, { error: "Your cart could not be read. Refresh the page and try again." })
    .min(1, { error: "Your cart is empty. Add something before checking out." })
    .max(MAX_CART_LINES, { error: `An order can hold up to ${MAX_CART_LINES} different items.` }),
  consent: z.literal(true, {
    error: "Please agree to the terms, refund and shipping policies to place your order",
  }),
  /** The total the shopper was shown. Only used to detect a changed cart, never to charge. */
  expectedTotal: z.number().finite().nonnegative().optional(),
  website: honeypotField,
});

export type MerchCheckoutInput = z.input<typeof merchCheckoutSchema>;
export type MerchCheckout = z.output<typeof merchCheckoutSchema>;
