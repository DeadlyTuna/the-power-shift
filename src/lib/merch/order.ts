import { whatsappLink } from "@/content/site";
import type { CheckoutSession } from "@/lib/payments/razorpay";
import { formatINR } from "@/lib/format";
import { variantLabel, type PricedCart } from "./pricing";

/**
 * Order helpers shared by the checkout API and the checkout page.
 * Nothing here touches personal data: references are opaque and the
 * WhatsApp message carries only the reference, items and totals.
 */

export const ORDER_PREFIX = "PSM-";

/** Opaque order reference, e.g. "PSM-MG4Z1K2A": the prefix plus a base-36 timestamp. */
export function orderReference(now: number = Date.now()): string {
  return `${ORDER_PREFIX}${now.toString(36).toUpperCase()}`;
}

/** Shape check for references arriving in URLs (any of ours or Razorpay's). */
export function isOrderReference(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{4,40}$/.test(value);
}

/** "power-shift-journal:-:2,progress-over-perfection-tee:M:1" for payment notes. */
export function compactItems(cart: Pick<PricedCart, "lines">): string {
  return cart.lines.map((l) => `${l.product.slug}:${l.variant ?? "-"}:${l.qty}`).join(",");
}

/** One line per item for people to read: "2 × Reframe Card Deck (Size M), ₹1,198". */
export function itemSummary(cart: Pick<PricedCart, "lines">): string[] {
  return cart.lines.map((l) => {
    const option = variantLabel(l.product, l.variant);
    return `${l.qty} × ${l.product.name}${option ? ` (${option})` : ""}, ${formatINR(l.lineTotal)}`;
  });
}

/** WhatsApp message for confirming an order without online payment. No address, email or name. */
export function whatsappOrderMessage(reference: string, cart: PricedCart): string {
  return [
    `Hi, I'd like to confirm my merch order ${reference}.`,
    "",
    ...itemSummary(cart),
    "",
    `Subtotal: ${formatINR(cart.subtotal)}`,
    `Shipping: ${cart.shipping === 0 ? "Free" : formatINR(cart.shipping)}`,
    `Total: ${formatINR(cart.total)}`,
    "",
    "Please share how I can pay.",
  ].join("\n");
}

export function whatsappOrderLink(reference: string, cart: PricedCart): string {
  return whatsappLink(whatsappOrderMessage(reference, cart));
}

/** What POST /api/checkout/merch returns on success. */
export type MerchCheckoutResponse =
  | { mode: "razorpay"; session: CheckoutSession; reference: string }
  | { mode: "whatsapp"; url: string; reference: string };
