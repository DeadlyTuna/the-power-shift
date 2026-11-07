"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ChevronDown, CircleCheck, LockKeyhole, ShoppingBag } from "lucide-react";
import { shipping } from "@/content/merch";
import { site, whatsappLink } from "@/content/site";
import { useCart } from "@/components/cart/CartProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxField, FormAlert, Honeypot, SelectField, TextField } from "@/components/ui/Field";
import { Card } from "@/components/ui/Layout";
import { WhatsAppIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { formatINR } from "@/lib/format";
import { postJSON } from "@/lib/http";
import { INDIAN_REGIONS } from "@/lib/merch/india";
import type { MerchCheckoutResponse } from "@/lib/merch/order";
import { priceCart, type PricedCart } from "@/lib/merch/pricing";
import { merchCheckoutSchema } from "@/lib/merch/schema";
import { startCheckout, type CheckoutStart } from "@/lib/payments/checkout-client";
import { fieldErrors } from "@/lib/validation";
import { OrderSummary } from "./OrderSummary";

export type PaymentMode = "razorpay" | "whatsapp";

type Values = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pin: string;
  consent: boolean;
  website: string;
};

type FieldName = Exclude<keyof Values, "website">;

const EMPTY: Values = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pin: "",
  consent: false,
  website: "",
};

/** API / zod error paths → form fields. */
const FIELD_FOR_PATH: Record<string, FieldName> = {
  "customer.name": "name",
  "customer.email": "email",
  "customer.phone": "phone",
  "address.line1": "line1",
  "address.line2": "line2",
  "address.city": "city",
  "address.state": "state",
  "address.pin": "pin",
  consent: "consent",
};

const ID_PREFIX = "checkout";
const ALERT_ID = "checkout-alert";

const STATE_OPTIONS = [...INDIAN_REGIONS].sort((a, b) => a.localeCompare(b)).map((s) => ({ value: s, label: s }));

type Alert = { tone: "error" | "info"; title?: string; message: string; showWhatsApp?: boolean };

type ShownAlert = Alert & { seq: number };

/** Request body for POST /api/checkout/merch (validated by merchCheckoutSchema on both sides). */
type CheckoutBody = {
  customer: { name: string; email: string; phone: string };
  address: { line1: string; line2: string; city: string; state: string; pin: string };
  lines: { slug: string; variant?: string; qty: number }[];
  consent: boolean;
  expectedTotal: number;
  website: string;
};

type Placed = { reference: string; url: string; cart: PricedCart };

type PaymentAttempt = { key: string; start: CheckoutStart; reference: string };

function mapErrors(paths: Record<string, string> | undefined) {
  const out: Partial<Record<FieldName, string>> = {};
  const rest: string[] = [];
  for (const [path, message] of Object.entries(paths ?? {})) {
    const field = FIELD_FOR_PATH[path];
    if (field) out[field] ??= message;
    else rest.push(message);
  }
  return { fields: out, rest };
}

export function CheckoutForm({ paymentMode }: { paymentMode: PaymentMode }) {
  const router = useRouter();
  const { lines, ready, clear } = useCart();
  const priced = useMemo(() => priceCart(lines), [lines]);

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [alert, setAlert] = useState<ShownAlert | null>(null);
  const [pending, setPending] = useState<"saving" | "paying" | null>(null);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const attempt = useRef<PaymentAttempt | null>(null);

  // Move focus to a new alert so screen readers announce it and it's scrolled into view.
  useEffect(() => {
    if (alert) document.getElementById(ALERT_ID)?.focus();
  }, [alert]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (key !== "website" && errors[key as FieldName]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  function showAlert(next: Alert) {
    setAlert((prev) => ({ ...next, seq: (prev?.seq ?? 0) + 1 }));
  }

  function payload(): CheckoutBody {
    return {
      customer: { name: values.name, email: values.email, phone: values.phone },
      address: { line1: values.line1, line2: values.line2, city: values.city, state: values.state, pin: values.pin },
      lines: lines.map((l) => ({ slug: l.slug, variant: l.variant, qty: l.qty })),
      consent: values.consent,
      expectedTotal: priced.total,
      website: values.website,
    };
  }

  async function pay(current: PaymentAttempt) {
    setPending("paying");
    const outcome = await startCheckout(current.start);
    if (outcome.status === "paid") {
      setRedirecting(true);
      track("Purchase", { value: priced.total, currency: "INR" });
      clear();
      router.push(outcome.redirectTo);
      return;
    }
    setPending(null);
    if (outcome.status === "dismissed") {
      showAlert({
        tone: "info",
        title: "Payment not completed",
        message: `Your order ${current.reference} is saved but not paid yet. When you're ready, choose “Pay ${formatINR(priced.total)} securely” to try again.`,
      });
    } else if (outcome.status === "failed") {
      showAlert({ tone: "error", title: "The payment didn't go through", message: outcome.error, showWhatsApp: true });
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const body = payload();
    const parsed = merchCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      const { fields, rest } = mapErrors(fieldErrors(parsed.error));
      setErrors(fields);
      const count = Object.keys(fields).length;
      showAlert({
        tone: "error",
        title: count ? `Please check ${count === 1 ? "1 field" : `${count} fields`}` : undefined,
        message: rest.length ? rest.join(" ") : "Fix the highlighted details, then try again.",
      });
      return;
    }
    if (priced.errors.length) {
      showAlert({ tone: "error", title: "Your cart needs a change", message: priced.errors.join(" ") });
      return;
    }

    setErrors({});
    setAlert(null);

    // Retry an opened-but-unpaid Razorpay order if nothing has changed since.
    const key = JSON.stringify(body);
    if (attempt.current && attempt.current.key === key) {
      await pay(attempt.current);
      return;
    }

    setPending("saving");
    const res = await postJSON<MerchCheckoutResponse>("/api/checkout/merch", body);
    if (!res.ok) {
      setPending(null);
      const { fields, rest } = mapErrors(res.fields);
      setErrors(fields);
      showAlert({
        tone: "error",
        message: [res.error, ...rest].join(" "),
        showWhatsApp: !res.fields,
      });
      return;
    }

    track("InitiateCheckout", { value: priced.total, currency: "INR" });

    if (res.mode === "whatsapp") {
      setPending(null);
      setPlaced({ reference: res.reference, url: res.url, cart: priced });
      return;
    }

    attempt.current = { key, start: { mode: "razorpay", session: res.session }, reference: res.reference };
    await pay(attempt.current);
  }

  if (placed) return <WhatsAppConfirmation placed={placed} onSend={clear} />;

  if (redirecting) {
    return (
      <div role="status" className="mt-10 flex items-center gap-3 text-lg text-jamun-900">
        <CircleCheck aria-hidden="true" className="size-6 text-peacock-600" />
        Payment received. Taking you to your order confirmation…
      </div>
    );
  }

  if (!ready) {
    return (
      <div aria-busy="true" className="mt-10">
        <p role="status" className="sr-only">
          Loading your order
        </p>
        <div aria-hidden="true" className="flex max-w-2xl animate-pulse flex-col gap-4">
          <div className="h-6 w-40 rounded bg-mist" />
          <div className="h-12 rounded-xl bg-mist" />
          <div className="h-12 rounded-xl bg-mist" />
          <div className="h-12 rounded-xl bg-mist" />
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <Card className="mx-auto mt-10 flex max-w-xl flex-col items-center px-6 py-12 text-center sm:px-10">
        <span aria-hidden="true" className="inline-flex size-14 items-center justify-center rounded-full bg-mist text-jamun-900">
          <ShoppingBag className="size-6" />
        </span>
        <h2 className="display-sm mt-5">Your cart is empty</h2>
        <p className="mt-3 max-w-sm text-muted">Add something from the merch range, then come back here to check out.</p>
        <ButtonLink href="/merch" arrow className="mt-7">
          Browse the merch
        </ButtonLink>
      </Card>
    );
  }

  const submitLabel =
    pending === "saving"
      ? "Saving your order…"
      : pending === "paying"
        ? "Waiting for payment…"
        : paymentMode === "razorpay"
          ? `Pay ${formatINR(priced.total)} securely`
          : "Send order on WhatsApp";

  const field = (name: Exclude<FieldName, "consent">) => ({
    name,
    idPrefix: ID_PREFIX,
    value: values[name],
    error: errors[name],
    onChange: (e: { target: { value: string } }) => set(name, e.target.value),
  });

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <form noValidate onSubmit={onSubmit} aria-describedby="checkout-intro" className="relative flex min-w-0 flex-col gap-10">
        <p id="checkout-intro" className="sr-only">
          All fields are required unless marked optional.
        </p>

        {/* Mobile: the order at a glance, expandable. */}
        <details className="group rounded-card border border-line bg-white lg:hidden">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2 font-semibold text-jamun-900">
              Order summary
              <ChevronDown aria-hidden="true" className="size-4 transition-transform duration-200 group-open:rotate-180" />
            </span>
            <span className="font-semibold text-jamun-900 tabular-nums">{formatINR(priced.total)}</span>
          </summary>
          <div className="border-t border-line px-5 pt-5 pb-5">
            <OrderSummary cart={priced} showLines />
            <Link href="/cart" className="mt-4 inline-flex min-h-11 items-center font-medium text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4">
              Edit cart
            </Link>
          </div>
        </details>

        <fieldset className="flex flex-col gap-5">
          <legend className="display-sm mb-5">Your details</legend>
          <TextField {...field("name")} label="Full name" autoComplete="name" />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              {...field("email")}
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              hint="So we can reach you about your order."
            />
            <TextField
              {...field("phone")}
              label="Mobile number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              hint="Couriers need a number to deliver."
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="display-sm mb-5">Shipping address</legend>
          <TextField {...field("line1")} label="Address line 1" hint="House or flat number, building, street." autoComplete="address-line1" />
          <TextField {...field("line2")} label="Address line 2" optional hint="Area, landmark." autoComplete="address-line2" />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField {...field("city")} label="Town or city" autoComplete="address-level2" />
            <TextField
              {...field("pin")}
              label="PIN code"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
          <SelectField
            name="state"
            idPrefix={ID_PREFIX}
            label="State or union territory"
            options={STATE_OPTIONS}
            placeholder="Choose one"
            autoComplete="address-level1"
            value={values.state}
            error={errors.state}
            onChange={(e) => set("state", e.target.value)}
          />
          <p className="text-sm text-muted">We ship within {shipping.region}.</p>
        </fieldset>

        <CheckboxField
          name="consent"
          idPrefix={ID_PREFIX}
          checked={values.consent}
          error={errors.consent}
          onChange={(e) => set("consent", e.target.checked)}
          label={
            <>
              I agree to the <PolicyLink href="/terms">terms &amp; conditions</PolicyLink>,{" "}
              <PolicyLink href="/refund-policy">refund policy</PolicyLink> and{" "}
              <PolicyLink href="/shipping-policy">shipping policy</PolicyLink>.
            </>
          }
        />

        <Honeypot value={values.website} onChange={(v) => set("website", v)} />

        <div className="flex flex-col gap-4">
          {alert ? (
            <FormAlert key={alert.seq} id={ALERT_ID} tone={alert.tone} title={alert.title}>
              <p>{alert.message}</p>
              {alert.showWhatsApp ? (
                <p className="mt-1">
                  Need a hand?{" "}
                  <a
                    href={whatsappLink("Hi, I need a hand with my merch order.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-4"
                  >
                    Message us on WhatsApp
                  </a>
                  .
                </p>
              ) : null}
            </FormAlert>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={pending !== null}
            icon={paymentMode === "razorpay" ? <LockKeyhole aria-hidden="true" /> : <WhatsAppIcon />}
            className="w-full sm:w-auto sm:self-start"
          >
            {submitLabel}
          </Button>
          <p className="text-sm text-muted">
            {paymentMode === "razorpay"
              ? "You'll pay in Razorpay's secure window. Your card and bank details never touch this site."
              : "We'll save your order, then you send it to us on WhatsApp to arrange payment."}
          </p>
        </div>
      </form>

      <aside aria-labelledby="checkout-summary-heading" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <Card className="p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="checkout-summary-heading" className="display-sm">
              Order summary
            </h2>
            <Link
              href="/cart"
              className="text-[0.9375rem] font-medium text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900"
            >
              Edit cart
            </Link>
          </div>
          <OrderSummary cart={priced} showLines className="mt-6" />
        </Card>
      </aside>
    </div>
  );
}

function PolicyLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener"
      className="font-medium text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </Link>
  );
}

/** Shown when payments aren't online: the order is saved; the shopper sends it on WhatsApp. */
function WhatsAppConfirmation({ placed, onSend }: { placed: Placed; onSend: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <Card className="p-6 sm:p-9">
        <span aria-hidden="true" className="inline-flex size-12 items-center justify-center rounded-full bg-peacock-50 text-peacock-600">
          <CircleCheck className="size-6" />
        </span>
        <h2 ref={heading} tabIndex={-1} className="display-md mt-5">
          Your order <span className="whitespace-nowrap">{placed.reference}</span> is saved
        </h2>
        <p className="lede mt-3 text-muted">
          Send it on WhatsApp to confirm payment. The message already has your order reference, items and total, and
          nothing else.
        </p>
        <ButtonLink
          href={placed.url}
          size="lg"
          icon={<WhatsAppIcon />}
          className="mt-7 w-full sm:w-auto"
          onClick={() => {
            setSent(true);
            onSend();
            track("Contact", { content_name: "merch-order", value: placed.cart.total, currency: "INR" });
          }}
        >
          Send order on WhatsApp
        </ButtonLink>
        <div role="status" className="mt-5 text-[0.9375rem] text-muted">
          {sent ? (
            <p>
              WhatsApp should have opened in a new tab. If it didn&rsquo;t, use the button again, or message{" "}
              <a href={`tel:${site.contact.phoneE164}`} className="font-medium text-jamun-900 underline underline-offset-4">
                {site.contact.phoneDisplay}
              </a>{" "}
              with your reference {placed.reference}.
            </p>
          ) : null}
        </div>
      </Card>
      <aside aria-label="Your order">
        <Card className="p-6 sm:p-7">
          <h2 className="display-sm">Your order</h2>
          <OrderSummary cart={placed.cart} showLines className="mt-6" />
        </Card>
      </aside>
    </div>
  );
}
