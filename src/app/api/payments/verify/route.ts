import { z } from "zod";
import { apiError, apiOk, parseBody } from "@/lib/http";
import { recordSubmission } from "@/lib/leads";
import {
  fetchOrder,
  orderNotes,
  paymentsConfigured,
  verifyPaymentSignature,
  type OrderKind,
} from "@/lib/payments/razorpay";

/**
 * Called by the browser after Razorpay Checkout succeeds.
 * Verifies the signature, reads what was bought from the order itself
 * (never from the browser), records the payment, and says where to go next.
 *
 * Order notes convention (set by the order-creation routes):
 *   kind: "program" | "merch"   slug: program slug   ref: our receipt / reference
 */

const schema = z.object({
  razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]+$/),
  razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]+$/),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});

export async function POST(request: Request) {
  if (!paymentsConfigured()) return apiError(503, "Online payments are not set up yet.");

  const { data, response } = await parseBody(request, schema);
  if (response) return response;

  const valid = verifyPaymentSignature({
    orderId: data.razorpay_order_id,
    paymentId: data.razorpay_payment_id,
    signature: data.razorpay_signature,
  });
  if (!valid) {
    return apiError(400, "We couldn't confirm this payment. If money was deducted, WhatsApp us with your payment reference.");
  }

  let notes: Record<string, string> = {};
  let receipt = "";
  let amountPaise = 0;
  try {
    const order = await fetchOrder(data.razorpay_order_id);
    notes = orderNotes(order);
    receipt = order.receipt ?? "";
    amountPaise = order.amount;
  } catch (err) {
    // The signature is valid, so the payment is genuine; fall back to a generic success page.
    console.error("[payments/verify] could not fetch order", err);
  }

  const kind = notes.kind as OrderKind | undefined;
  const reference = notes.ref || receipt || data.razorpay_payment_id;

  await recordSubmission("payment", {
    status: "paid",
    source: "checkout",
    kind: kind ?? "unknown",
    reference,
    orderId: data.razorpay_order_id,
    paymentId: data.razorpay_payment_id,
    amount: amountPaise / 100,
    ...notes,
  });

  let redirectTo = `/thank-you?ref=${encodeURIComponent(reference)}`;
  if (kind === "merch") redirectTo = `/order/success?ref=${encodeURIComponent(reference)}`;
  if (kind === "program" && notes.slug) {
    redirectTo = `/thank-you?program=${encodeURIComponent(notes.slug)}&ref=${encodeURIComponent(reference)}`;
  }

  return apiOk({ redirectTo, reference });
}
