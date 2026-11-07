"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { FormSwap, SuccessCheck, useFocusOnMount } from "@/components/contact/FormMotion";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxField, FormAlert, Honeypot, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { track } from "@/lib/analytics";
import { postJSON } from "@/lib/http";
import { fieldErrors } from "@/lib/validation";
import { bookingSchema, bookingTopicOptions, preferredTimeOptions } from "./booking-schema";

/** "+919876543210" → "+91 98765 43210" for the confirmation message. */
function displayPhone(e164: string): string {
  const indian = e164.match(/^\+91(\d{5})(\d{5})$/);
  return indian ? `+91 ${indian[1]} ${indian[2]}` : e164;
}

/**
 * Clarity-call request, used when no booking calendar is configured.
 * Checks fields in the browser with the same schema the API uses, then POSTs
 * to /api/booking. Manisha's team confirms a time on WhatsApp.
 */
export function BookingForm({ idPrefix = "book" }: { idPrefix?: string }) {
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState<{ firstName: string; phone: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [failures, setFailures] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const alertId = `${idPrefix}-alert`;

  // Move focus to the error summary after each failed attempt. The confirmation focuses itself once it appears.
  useEffect(() => {
    if (failures > 0) document.getElementById(alertId)?.focus();
  }, [failures, alertId]);

  function fail(message: string, fields: Record<string, string> = {}) {
    setErrors(fields);
    setFormError(message);
    setFailures((n) => n + 1);
  }

  function clearError(name: string) {
    if (!errors[name]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "");
    const payload = {
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      topic: text("topic"),
      preferredTime: text("preferredTime"),
      note: text("note"),
      consent: form.get("consent") === "on",
      website: honeypot,
    };

    const check = bookingSchema.safeParse(payload);
    if (!check.success) {
      fail("Please check the highlighted fields.", fieldErrors(check.error));
      return;
    }

    setPending(true);
    setFormError(null);
    setErrors({});
    const result = await postJSON("/api/booking", payload);
    setPending(false);

    if (!result.ok) {
      fail(result.error, result.fields);
      return;
    }

    track("Schedule", { source: "book", topic: check.data.topic });
    setConfirmed({ firstName: check.data.name.split(/\s+/)[0] ?? "", phone: displayPhone(check.data.phone) });
  }

  const form = (
    <form
      noValidate
      onSubmit={onSubmit}
      onChange={(e) => {
        const field = e.target as EventTarget;
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
          clearError(field.name);
        }
      }}
      className="relative flex flex-col gap-5"
      aria-describedby={formError ? alertId : undefined}
    >
      {formError ? (
        <FormAlert id={alertId} title="Your request wasn't sent">
          {formError}
        </FormAlert>
      ) : null}

      <TextField idPrefix={idPrefix} name="name" label="Your name" autoComplete="name" error={errors.name} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          idPrefix={idPrefix}
          name="email"
          type="email"
          inputMode="email"
          label="Email"
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          idPrefix={idPrefix}
          name="phone"
          type="tel"
          inputMode="tel"
          label="WhatsApp number"
          hint="We'll confirm your time here"
          autoComplete="tel"
          placeholder="98765 43210"
          error={errors.phone}
        />
      </div>
      <SelectField
        idPrefix={idPrefix}
        name="topic"
        label="What would you like help with?"
        options={[...bookingTopicOptions]}
        error={errors.topic}
      />
      <SelectField
        idPrefix={idPrefix}
        name="preferredTime"
        label="When usually suits you?"
        hint="All times are IST"
        options={[...preferredTimeOptions]}
        error={errors.preferredTime}
      />
      <TextAreaField
        idPrefix={idPrefix}
        name="note"
        label="Anything you'd like Manisha to know?"
        optional
        rows={3}
        maxLength={1000}
        error={errors.note}
      />
      <CheckboxField
        idPrefix={idPrefix}
        name="consent"
        error={errors.consent}
        label={
          <>
            I agree to Manisha Agrawal&apos;s team contacting me on WhatsApp, phone or email about this call. See the{" "}
            <Link href="/privacy-policy" className="underline underline-offset-4">
              privacy policy
            </Link>
            .
          </>
        }
      />

      <Honeypot value={honeypot} onChange={setHoneypot} />

      <div>
        <Button type="submit" size="lg" arrow={!pending} disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending your request…" : "Request my clarity call"}
        </Button>
        <p aria-live="polite" className="sr-only">
          {pending ? "Sending your request" : ""}
        </p>
      </div>
    </form>
  );

  return (
    <FormSwap
      done={confirmed !== null}
      form={form}
      success={confirmed ? <BookingConfirmation firstName={confirmed.firstName} phone={confirmed.phone} /> : null}
    />
  );
}

function BookingConfirmation({ firstName, phone }: { firstName: string; phone: string }) {
  const heading = useFocusOnMount<HTMLHeadingElement>();
  return (
    <div className="flex flex-col items-start gap-4" role="status">
      <SuccessCheck />
      <h3 ref={heading} tabIndex={-1} className="display-sm focus:outline-none">
        Thank you{firstName ? `, ${firstName}` : ""}. Your request is in.
      </h3>
      <p className="text-ink">
        Manisha&apos;s team will reach out on WhatsApp at <span className="font-semibold">{phone}</span> to confirm a time
        for your call.
      </p>
      <p className="text-muted">
        While you wait, take the free Power Self-Assessment. Your results make a useful starting point for the
        conversation.
      </p>
      <ButtonLink href="/assessment" variant="outline" arrow className="mt-2 text-balance">
        Take the free Power Self-Assessment
      </ButtonLink>
    </div>
  );
}
