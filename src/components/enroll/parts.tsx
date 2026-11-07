"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CheckboxField, FormAlert, TextField } from "@/components/ui/Field";
import type { AlertState } from "./form-state";

/** Building blocks shared by the registration, waitlist and application forms. */

export function ContactFields({
  idPrefix,
  errors,
  phoneHint,
}: {
  idPrefix: string;
  errors: Record<string, string>;
  phoneHint?: string;
}) {
  return (
    <>
      <TextField
        idPrefix={idPrefix}
        name="name"
        label="Full name"
        autoComplete="name"
        autoCapitalize="words"
        maxLength={80}
        error={errors.name}
      />
      <TextField
        idPrefix={idPrefix}
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={254}
        placeholder="name@example.com"
        error={errors.email}
      />
      <TextField
        idPrefix={idPrefix}
        name="phone"
        type="tel"
        label="WhatsApp number"
        hint={phoneHint}
        autoComplete="tel"
        inputMode="tel"
        maxLength={20}
        placeholder="98765 43210"
        error={errors.phone}
      />
    </>
  );
}

export function ConsentField({ idPrefix, error, text }: { idPrefix: string; error?: string; text: string }) {
  return (
    <CheckboxField
      idPrefix={idPrefix}
      name="consent"
      error={error}
      label={
        <>
          {text} See the{" "}
          <Link
            href="/privacy-policy"
            target="_blank"
            className="font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-2 hover:decoration-jamun-900"
          >
            privacy policy<span className="sr-only"> (opens in a new tab)</span>
          </Link>
          .
        </>
      }
    />
  );
}

/** The form-level alert, placed right above the submit button. */
export function FormMessage({
  id,
  alert,
  onRetryPayment,
  retryLabel = "Return to payment",
}: {
  id: string;
  alert: AlertState | null;
  onRetryPayment?: () => void;
  retryLabel?: string;
}) {
  if (!alert) return null;
  return (
    <FormAlert id={id} tone={alert.tone} title={alert.title}>
      <p>{alert.message}</p>
      {alert.retryPayment && onRetryPayment ? (
        <Button variant="dark" size="sm" className="mt-3" onClick={onRetryPayment}>
          {retryLabel}
        </Button>
      ) : null}
    </FormAlert>
  );
}

/** Replaces a form after it succeeds without leaving the page. Focus moves to its heading. */
export function SuccessPanel({ title, children }: { title: string; children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <div className="rounded-card border border-peacock-600/25 bg-peacock-50 p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-peacock-600 text-white"
        >
          <Check className="size-5" strokeWidth={2.5} />
        </span>
        <h3 ref={heading} tabIndex={-1} className="display-sm text-jamun-900 focus-visible:shadow-none focus-visible:outline-none">
          {title}
        </h3>
      </div>
      <div className="mt-4 flex flex-col gap-4 text-ink">{children}</div>
    </div>
  );
}

/** A small icon + text line under the submit button. */
export function FinePrint({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 text-sm leading-snug text-muted">
      <span aria-hidden="true" className="mt-px shrink-0 text-jamun-700 [&>svg]:size-4">
        {icon}
      </span>
      <span>{children}</span>
    </p>
  );
}
