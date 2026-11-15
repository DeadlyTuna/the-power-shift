"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BadgeIndianRupee, LockKeyhole, ShieldCheck } from "lucide-react";
import type { Program } from "@/content/programs";
import { communityLink } from "@/content/site";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Honeypot } from "@/components/ui/Field";
import { WhatsAppIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { formatINR } from "@/lib/format";
import { postJSON } from "@/lib/http";
import { startCheckout, type CheckoutStart } from "@/lib/payments/checkout-client";
import { changedFieldName, textValue, useFormState } from "./form-state";
import { useDemoCheckout } from "./DemoCheckout";
import { closedHeadline, WAITLIST_INVITE } from "./messages";
import { ConsentField, ContactFields, FinePrint, FormMessage, SuccessPanel } from "./parts";
import { useEventStatus } from "./use-now";

/**
 * Registration for live events ("free" and "paid" programs).
 *
 *  open    free  → POST /api/register → /thank-you?program=<slug>
 *          paid  → POST /api/checkout/program → Razorpay Checkout, the hosted payment page,
 *                  or (MOCK programs without Razorpay) the demo checkout dialog
 *  closed        → waitlist: POST /api/register { intent: "waitlist" } → inline confirmation
 *  pending       → server render / hydration: neutral form, submit disabled until the
 *                  browser has decided whether the event is still open
 */

const FIELDS = ["name", "email", "phone", "consent"] as const;

const CONSENT_REGISTER = "I agree to receive the joining link and updates on WhatsApp and email.";
const CONSENT_WAITLIST = "I agree to receive updates about the next date on WhatsApp and email.";

/** Only follow same-site paths returned by the server. */
function safePath(path: string): string {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/thank-you";
}

type PaidPhase = "creating" | "paying" | "redirecting";

export function RegistrationForm({
  program,
  source,
  idPrefix,
}: {
  program: Program;
  source?: string;
  idPrefix: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const clientStatus = useEventStatus(program.event?.startsAt);
  const [closedByServer, setClosedByServer] = useState(false);
  const status = closedByServer ? "closed" : clientStatus;
  const [honeypot, setHoneypot] = useState("");
  const [phase, setPhase] = useState<PaidPhase>("creating");
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);
  /** The order from the last attempt, reused if the visitor closes the payment window and tries again. */
  const lastCheckout = useRef<{ key: string; start: CheckoutStart } | null>(null);

  const alertId = `${idPrefix}-alert`;
  const form = useFormState(alertId, FIELDS);
  const demo = useDemoCheckout();

  const paid = program.mode === "paid";
  const price = program.price?.amount;
  const priceLabel = price !== undefined ? formatINR(price) : undefined;

  if (joinedWaitlist) {
    const community = communityLink(
      `Hi, I've joined the waitlist for the ${program.shortTitle}. Please add me to the community.`,
    );
    return (
      <SuccessPanel title="You're on the waitlist.">
        <p>We&apos;ll let you know on WhatsApp and email when the next {program.shortTitle} date is announced.</p>
        <p>Meanwhile, join the WhatsApp community, where new dates and session updates are shared.</p>
        <div>
          <ButtonLink href={community.href} size="lg" icon={<WhatsAppIcon />} className="w-full sm:w-auto">
            {community.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </ButtonLink>
        </div>
      </SuccessPanel>
    );
  }

  const idleLabel =
    status === "pending"
      ? "Continue"
      : status === "closed"
        ? "Join the waitlist"
        : paid
          ? priceLabel
            ? `Pay ${priceLabel} and reserve my seat`
            : "Continue to payment"
          : "Reserve my free seat";

  const pendingLabel =
    status === "closed"
      ? "Joining the waitlist…"
      : !paid
        ? "Reserving your seat…"
        : phase === "redirecting"
          ? "Opening the payment page…"
          : phase === "paying"
            ? "Waiting for payment…"
            : "Opening secure payment…";

  async function pay(start: CheckoutStart) {
    track("InitiateCheckout", { value: price, currency: "INR", content_name: program.shortTitle, source });
    setPhase(start.mode === "link" ? "redirecting" : "paying");
    const outcome = await startCheckout(start, {
      confirmDemo: (demoStart) =>
        demo.confirm({ item: program.title, amount: price, reference: demoStart.reference }),
    });
    switch (outcome.status) {
      case "paid":
        if (outcome.reference) {
          track("Purchase", { value: price, currency: "INR", content_name: program.shortTitle, source });
        }
        lastCheckout.current = null;
        router.push(safePath(outcome.redirectTo));
        return; // stay pending while the thank-you page loads
      case "redirected":
        return; // the browser is on its way to the hosted payment page
      case "dismissed":
        form.showAlert({
          tone: "info",
          title: "Your seat isn't confirmed yet",
          message:
            start.mode === "demo"
              ? "The demo checkout was closed before it was completed. Your seat is reserved once you complete the demo payment."
              : `The payment window was closed before the payment went through. Your seat is reserved only once ${priceLabel ? `the ${priceLabel} payment` : "the payment"} is complete.`,
          retryPayment: true,
        });
        return;
      case "failed":
        form.showAlert({ tone: "error", message: outcome.error });
        return;
    }
  }

  /** The server says the start time has passed (e.g. this device's clock is behind): offer the waitlist. */
  function switchToWaitlist() {
    setClosedByServer(true);
    form.showAlert({
      tone: "info",
      title: "This date has just closed",
      message: "Your details are still filled in. Select Join the waitlist to hear about the next date.",
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.pending || status === "pending") return;

    const data = new FormData(event.currentTarget);
    const body = {
      slug: program.slug,
      name: textValue(data, "name"),
      email: textValue(data, "email"),
      phone: textValue(data, "phone"),
      consent: data.get("consent") === "on",
      website: textValue(data, "website"),
      source,
    };

    form.begin();
    setPhase("creating");

    if (status === "closed") {
      const result = await postJSON("/api/register", { ...body, intent: "waitlist" });
      if (!result.ok) return form.fail(result);
      track("Lead", { content_name: program.shortTitle, source });
      form.end();
      setJoinedWaitlist(true);
      return;
    }

    if (!paid) {
      const result = await postJSON("/api/register", { ...body, intent: "register" });
      if (!result.ok) {
        if (result.fields?.event) return switchToWaitlist();
        return form.fail(result);
      }
      track("CompleteRegistration", { content_name: program.shortTitle, source });
      router.push(`/thank-you?program=${encodeURIComponent(program.slug)}`);
      return; // stay pending while the thank-you page loads
    }

    const key = JSON.stringify([body.name, body.email, body.phone, body.consent]);
    let start = lastCheckout.current?.key === key ? lastCheckout.current.start : null;
    if (!start) {
      const result = await postJSON<CheckoutStart>("/api/checkout/program", body);
      if (!result.ok) {
        if (result.fields?.event) return switchToWaitlist();
        return form.fail(result);
      }
      start = result;
      // Reusable orders: a Razorpay order, or a demo checkout reference (one record per attempt).
      lastCheckout.current = start.mode === "razorpay" || start.mode === "demo" ? { key, start } : null;
    }
    await pay(start);
  }

  const busy = form.pending;
  const consentText = status === "closed" ? CONSENT_WAITLIST : CONSENT_REGISTER;

  return (
    <form
      ref={formRef}
      method="post"
      noValidate
      onSubmit={onSubmit}
      onChange={(event) => {
        const name = changedFieldName(event.target);
        if (name) form.clearError(name);
      }}
      className="relative flex flex-col gap-5"
    >
      {status === "closed" ? (
        <div className="rounded-xl border border-line bg-mist px-4 py-3.5">
          <p className="font-semibold text-jamun-900">{closedHeadline(program)}</p>
          <p className="mt-1 text-[0.9375rem] leading-snug text-muted">{WAITLIST_INVITE}</p>
        </div>
      ) : null}

      <ContactFields
        idPrefix={idPrefix}
        errors={form.errors}
        phoneHint={status === "closed" ? "We'll send news of the next date here." : "We'll send session updates here."}
      />
      <ConsentField idPrefix={idPrefix} error={form.errors.consent} text={consentText} />
      <Honeypot value={honeypot} onChange={setHoneypot} />

      <FormMessage id={alertId} alert={form.alert} onRetryPayment={() => formRef.current?.requestSubmit()} />

      <Button
        type="submit"
        size="lg"
        arrow={!busy && status !== "pending"}
        disabled={status === "pending"}
        aria-disabled={busy || undefined}
        className="w-full"
      >
        {busy ? pendingLabel : idleLabel}
      </Button>
      <p aria-live="polite" className="sr-only">
        {busy ? pendingLabel : ""}
      </p>

      {status === "open" && paid ? (
        <div className="flex flex-col gap-3">
          <FinePrint icon={<LockKeyhole />}>Secure payment by Razorpay: UPI, cards and netbanking.</FinePrint>
          {program.guarantee ? (
            <FinePrint icon={<ShieldCheck />}>
              <strong className="font-semibold text-jamun-900">Money-back guarantee.</strong> {program.guarantee}
            </FinePrint>
          ) : null}
        </div>
      ) : null}
      {status === "open" && !paid ? (
        <FinePrint icon={<BadgeIndianRupee />}>
          100% free, no hidden charges. The joining link is shared in the WhatsApp community after you register.
        </FinePrint>
      ) : null}
      {demo.dialog}
    </form>
  );
}
