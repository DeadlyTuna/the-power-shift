import { z } from "zod";
import { getProgram, isEventOpen, type Program } from "@/content/programs";
import { site } from "@/content/site";
import { closedMessage } from "@/components/enroll/messages";
import { formatEventTime, formatShortDate, toPaise } from "@/lib/format";
import { apiError, apiOk, parseBody } from "@/lib/http";
import { recordSubmission, SAVE_FAILED_MESSAGE } from "@/lib/leads";
import { createOrder, paymentsConfigured, publicKeyId, sanitizeNotes, type CheckoutSession } from "@/lib/payments/razorpay";
import { isRealAuth } from "@/lib/supabase/env";
import { currentUser } from "@/lib/supabase/server";
import { contactBase, isBot } from "@/lib/validation";

/**
 * POST /api/checkout/program
 * Starts payment for a paid live event or self-paced course and returns a CheckoutStart for
 * startCheckout() in the browser:
 *   { mode: "razorpay", session }  when Razorpay API keys are configured
 *   { mode: "demo", reference, redirectTo }
 *                                  MOCK programs (see src/content/programs.ts) while Razorpay
 *                                  isn't configured: nothing is charged; the browser shows a
 *                                  demo checkout dialog and treats confirming it as paid
 *   { mode: "link", url }          otherwise, the program's hosted payment page
 *
 * The amount always comes from src/content/programs.ts, never from the browser.
 * Body: { slug, name, email, phone, consent, website, source? }
 */

const schema = contactBase.extend({
  slug: z.string().trim().min(1, { error: "Choose a program" }).max(80),
  source: z.string().trim().max(80).optional(),
});

/** "leadership-confidence-workshop" → "LCW" */
function slugCode(slug: string): string {
  return (
    slug
      .split("-")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 6) || "EV"
  );
}

/** Our payment reference, e.g. "PS-LCW-MGD3K2QX". Opaque: safe to show and to put in URLs. */
function newReference(program: Program): string {
  return `PS-${slugCode(program.slug)}-${Date.now().toString(36).toUpperCase()}`;
}

/** Demo checkout reference, e.g. "DEMO-MGD3K2QX". Clearly not a real payment. */
function newDemoReference(): string {
  return `DEMO-${Date.now().toString(36).toUpperCase()}`;
}

/** Same destination a verified payment is sent to (see /api/payments/verify). */
function thankYouPath(program: Program, reference: string): string {
  return `/thank-you?program=${encodeURIComponent(program.slug)}&ref=${encodeURIComponent(reference)}`;
}

const NO_PAYMENT_MESSAGE = `Online payment isn't available right now. Message us on WhatsApp at ${site.contact.phoneDisplay} and we'll help you reserve your seat.`;

export async function POST(request: Request) {
  const { data, response } = await parseBody(request, schema);
  if (response) return response;

  // Bots fill the hidden field; answer as if it worked and record nothing.
  if (isBot(data)) return apiOk({ mode: "free" as const, redirectTo: "/thank-you" });

  const program = getProgram(data.slug);
  if (!program) {
    return apiError(404, "We couldn't find that program. Refresh the page and try again.");
  }
  if (program.mode !== "paid") {
    return apiError(400, "This program doesn't need a payment. Use the registration form on its page instead.");
  }
  if (!isEventOpen(program)) {
    const message = closedMessage(program);
    return apiError(409, message, { event: message });
  }

  const amount = program.price?.amount;
  if (!amount || amount <= 0) {
    console.error(`[checkout/program] ${program.slug} is a paid program without a price in src/content/programs.ts`);
    return apiError(503, NO_PAYMENT_MESSAGE);
  }

  // With real student accounts, a course is tied to the signed-in student who pays for it.
  const student = program.course && isRealAuth ? await currentUser() : null;
  if (program.course && isRealAuth && !student) {
    return apiError(401, "Sign in to your student account to enroll, then try again.");
  }

  const reference = newReference(program);
  const lead = {
    program: program.slug,
    programTitle: program.title,
    eventStartsAt: program.event?.startsAt ?? "",
    eventDate: program.event
      ? `${formatShortDate(program.event.startsAt)}, ${formatEventTime(program.event.startsAt)}`
      : "",
    reference,
    amount,
    currency: "INR",
    name: data.name,
    email: data.email,
    phone: data.phone,
    consent: data.consent,
    source: data.source ?? "",
    studentId: student?.id ?? "",
  };

  if (paymentsConfigured()) {
    let orderId: string;
    let orderAmount: number;
    try {
      const order = await createOrder({
        amountPaise: toPaise(amount),
        receipt: reference,
        notes: sanitizeNotes({
          kind: "program",
          slug: program.slug,
          ref: reference,
          name: data.name,
          email: data.email,
          phone: data.phone,
          source: data.source,
          // The verify route and webhook grant course access to this student once the payment is confirmed.
          uid: student?.id,
        }),
      });
      orderId = order.id;
      orderAmount = order.amount;
    } catch (err) {
      console.error("[checkout/program] order creation failed", err);
      return apiError(
        502,
        `We couldn't start the payment just now. Please try again in a minute, or message us on WhatsApp at ${site.contact.phoneDisplay} to reserve your seat.`,
      );
    }

    const saved = await recordSubmission("registration", { ...lead, status: "payment-pending", orderId });
    if (!saved.ok) return apiError(503, SAVE_FAILED_MESSAGE);

    const session: CheckoutSession = {
      keyId: publicKeyId(),
      orderId,
      amount: orderAmount,
      currency: "INR",
      name: site.brand,
      description: program.shortTitle,
      prefill: { name: data.name, email: data.email, contact: data.phone },
    };
    return apiOk({ mode: "razorpay" as const, session });
  }

  // Demo checkout for MOCK programs: no payment provider is involved and nothing is charged.
  // Real (non-mock) programs never reach this branch.
  if (program.mock) {
    const demoReference = newDemoReference();
    const saved = await recordSubmission("registration", {
      ...lead,
      reference: demoReference,
      amount: 0,
      listedAmount: amount,
      status: "demo-paid",
      kind: program.course ? "course" : "event",
    });
    if (!saved.ok) return apiError(503, SAVE_FAILED_MESSAGE);
    return apiOk({ mode: "demo" as const, reference: demoReference, redirectTo: thankYouPath(program, demoReference) });
  }

  if (program.paymentLink) {
    const saved = await recordSubmission("registration", {
      ...lead,
      status: "payment-pending-link",
      paymentLink: program.paymentLink,
    });
    if (!saved.ok) return apiError(503, SAVE_FAILED_MESSAGE);
    return apiOk({ mode: "link" as const, url: program.paymentLink });
  }

  return apiError(503, NO_PAYMENT_MESSAGE);
}
