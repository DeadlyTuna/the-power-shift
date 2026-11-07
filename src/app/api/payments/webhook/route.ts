import { getProgram } from "@/content/programs";
import { recordSubmission } from "@/lib/leads";
import { grantEnrollment } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

/**
 * Razorpay webhook (Dashboard → Settings → Webhooks).
 * URL: https://<your-domain>/api/payments/webhook
 * Events: payment.captured, payment.failed, order.paid, refund.processed
 *
 * This is the source of truth if a visitor closes the tab before the
 * browser-side verification finishes.
 */

type WebhookBody = {
  event?: string;
  payload?: {
    payment?: { entity?: Record<string, unknown> };
    order?: { entity?: Record<string, unknown> };
    refund?: { entity?: Record<string, unknown> };
  };
};

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature"))) {
    return new Response("Invalid signature", { status: 400 });
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(raw) as WebhookBody;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const payment = body.payload?.payment?.entity ?? {};
  const order = body.payload?.order?.entity ?? {};
  const refund = body.payload?.refund?.entity ?? {};
  const notes = (order.notes && !Array.isArray(order.notes) ? order.notes : payment.notes) as
    | Record<string, string>
    | undefined;

  await recordSubmission("payment", {
    source: "webhook",
    event: body.event ?? "unknown",
    status: (payment.status as string) ?? (order.status as string) ?? "",
    orderId: (payment.order_id as string) ?? (order.id as string) ?? "",
    paymentId: (payment.id as string) ?? "",
    refundId: (refund.id as string) ?? "",
    amount: typeof payment.amount === "number" ? payment.amount / 100 : undefined,
    email: payment.email,
    contact: payment.contact,
    ...(notes && !Array.isArray(notes) ? notes : {}),
  });

  // A paid course for a real student account: make sure access is granted even if the browser never returned.
  const paid = body.event === "payment.captured" || body.event === "order.paid";
  if (paid && notes && !Array.isArray(notes) && notes.uid && notes.slug && getProgram(notes.slug)?.course) {
    await grantEnrollment(notes.uid, notes.slug, notes.ref || String(payment.id ?? order.id ?? ""));
  }

  // Always acknowledge a verified webhook so Razorpay doesn't retry indefinitely.
  return new Response("ok", { status: 200 });
}
