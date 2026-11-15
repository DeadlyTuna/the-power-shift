import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal Razorpay server client (Orders API + signature checks).
 * Uses the REST API directly so no SDK is needed.
 *
 * Env:
 *   RAZORPAY_KEY_ID         rzp_test_… / rzp_live_…
 *   RAZORPAY_KEY_SECRET     server-only, never sent to the browser
 *   RAZORPAY_WEBHOOK_SECRET for /api/payments/webhook
 */

const API = "https://api.razorpay.com/v1";

export type OrderKind = "program" | "merch";

/** Razorpay allows at most 15 notes, each value up to 256 characters. */
export type OrderNotes = Record<string, string>;

export type RazorpayOrder = {
  id: string;
  amount: number;
  amount_paid: number;
  currency: string;
  receipt: string | null;
  status: "created" | "attempted" | "paid";
  notes: OrderNotes | [];
  created_at: number;
};

/** What the browser needs to open Razorpay Checkout. Contains no secrets. */
export type CheckoutSession = {
  keyId: string;
  orderId: string;
  /** Amount in paise. */
  amount: number;
  currency: "INR";
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
};

export function paymentsConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) throw new Error("Razorpay is not configured");
  return { keyId, secret };
}

function authHeader() {
  const { keyId, secret } = credentials();
  return `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}`;
}

export function publicKeyId(): string {
  return credentials().keyId;
}

/** Trim notes to Razorpay's limits so order creation never fails on long values. */
export function sanitizeNotes(notes: Record<string, string | number | undefined>): OrderNotes {
  const out: OrderNotes = {};
  for (const [key, value] of Object.entries(notes)) {
    if (value === undefined || value === "") continue;
    if (Object.keys(out).length >= 15) break;
    out[key.slice(0, 40)] = String(value).slice(0, 255);
  }
  return out;
}

export async function createOrder(input: {
  amountPaise: number;
  receipt: string;
  notes: OrderNotes;
}): Promise<RazorpayOrder> {
  if (!Number.isInteger(input.amountPaise) || input.amountPaise < 100) {
    throw new Error(`Invalid order amount: ${input.amountPaise}`);
  }
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return (await res.json()) as RazorpayOrder;
}

export async function fetchOrder(orderId: string): Promise<RazorpayOrder> {
  if (!/^order_[A-Za-z0-9]+$/.test(orderId)) throw new Error("Invalid order id");
  const res = await fetch(`${API}/orders/${orderId}`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Razorpay order fetch failed (${res.status})`);
  return (await res.json()) as RazorpayOrder;
}

function safeEqualHex(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Checkout success handler signature: HMAC_SHA256(order_id|payment_id, key_secret). */
export function verifyPaymentSignature(input: { orderId: string; paymentId: string; signature: string }): boolean {
  const { secret } = credentials();
  const expected = createHmac("sha256", secret).update(`${input.orderId}|${input.paymentId}`).digest("hex");
  return safeEqualHex(expected, input.signature);
}

/** Webhook signature: HMAC_SHA256(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Notes come back as [] when empty; normalise to an object. */
export function orderNotes(order: RazorpayOrder): OrderNotes {
  return Array.isArray(order.notes) ? {} : order.notes;
}
