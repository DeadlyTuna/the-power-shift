"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { site } from "@/content/site";
import { FormSwap, SuccessCheck, useFocusOnMount } from "@/components/contact/FormMotion";
import { Button } from "@/components/ui/Button";
import { CheckboxField, FieldError, FormAlert, Honeypot, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { track } from "@/lib/analytics";
import { postJSON } from "@/lib/http";
import { fieldErrors } from "@/lib/validation";
import { deliveryFormatOptions, enquirySchema, enquiryTopicOptions, teamSizeOptions } from "./enquiry-schema";

/**
 * Corporate training enquiry. Checks fields in the browser with the same
 * schema the API uses, then POSTs to /api/enquiry.
 */
export function EnquiryForm({ idPrefix = "enquiry" }: { idPrefix?: string }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [firstName, setFirstName] = useState("");
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
      organisation: text("organisation"),
      role: text("role"),
      teamSize: text("teamSize"),
      topics: form.getAll("topics").map(String),
      format: text("format"),
      message: text("message"),
      consent: form.get("consent") === "on",
      website: honeypot,
    };

    const check = enquirySchema.safeParse(payload);
    if (!check.success) {
      fail("Please check the highlighted fields.", fieldErrors(check.error));
      return;
    }

    setPending(true);
    setFormError(null);
    setErrors({});
    const result = await postJSON("/api/enquiry", payload);
    setPending(false);

    if (!result.ok) {
      fail(result.error, result.fields);
      return;
    }

    track("Lead", { source: "corporate", content_name: "corporate-training" });
    setFirstName(check.data.name.split(/\s+/)[0] ?? "");
    setDone(true);
  }

  const topicsError = errors.topics ?? Object.entries(errors).find(([key]) => key.startsWith("topics."))?.[1];

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
        <FormAlert id={alertId} title="Your enquiry wasn't sent">
          {formError}
        </FormAlert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField idPrefix={idPrefix} name="name" label="Your name" autoComplete="name" error={errors.name} />
        <TextField
          idPrefix={idPrefix}
          name="role"
          label="Your role"
          autoComplete="organization-title"
          placeholder="e.g. L&D Manager"
          error={errors.role}
        />
        <TextField
          idPrefix={idPrefix}
          name="email"
          type="email"
          inputMode="email"
          label="Work email"
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          idPrefix={idPrefix}
          name="phone"
          type="tel"
          inputMode="tel"
          label="Phone"
          hint="Indian mobile, or international with country code"
          autoComplete="tel"
          error={errors.phone}
        />
      </div>

      <TextField
        idPrefix={idPrefix}
        name="organisation"
        label="Organisation"
        autoComplete="organization"
        error={errors.organisation}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          idPrefix={idPrefix}
          name="teamSize"
          label="How many people?"
          options={[...teamSizeOptions]}
          error={errors.teamSize}
        />
        <SelectField
          idPrefix={idPrefix}
          name="format"
          label="Preferred format"
          options={[...deliveryFormatOptions]}
          error={errors.format}
        />
      </div>

      <fieldset aria-describedby={topicsError ? `${idPrefix}-topics-error` : `${idPrefix}-topics-hint`}>
        <legend className="text-[0.9375rem] font-semibold text-jamun-900">
          Topics you&apos;re interested in <span className="ml-1 font-normal text-muted">(optional)</span>
        </legend>
        <p id={`${idPrefix}-topics-hint`} className="mt-1 text-sm text-muted">
          Choose any that apply. Not sure yet? Leave them blank and we&apos;ll talk it through.
        </p>
        <div className="mt-3 grid gap-x-5 gap-y-3 sm:grid-cols-2">
          {enquiryTopicOptions.map((topic) => (
            <CheckboxField
              key={topic.value}
              idPrefix={`${idPrefix}-topic-${topic.value}`}
              name="topics"
              value={topic.value}
              label={topic.label}
              wrapperClassName="min-h-11 justify-center"
            />
          ))}
        </div>
        <div className="mt-2">
          <FieldError id={`${idPrefix}-topics-error`} error={topicsError} />
        </div>
      </fieldset>

      <TextAreaField
        idPrefix={idPrefix}
        name="message"
        label="What would you like to achieve?"
        hint="Context helps: the group, what's prompting this, any dates you have in mind."
        optional
        maxLength={2000}
        error={errors.message}
      />

      <CheckboxField
        idPrefix={idPrefix}
        name="consent"
        error={errors.consent}
        label={
          <>
            I agree to Manisha Agrawal&apos;s team contacting me about this enquiry by email, phone or WhatsApp. See the{" "}
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
          {pending ? "Sending your enquiry…" : "Send my enquiry"}
        </Button>
        <p aria-live="polite" className="sr-only">
          {pending ? "Sending your enquiry" : ""}
        </p>
      </div>
    </form>
  );

  return <FormSwap done={done} form={form} success={done ? <EnquiryConfirmation firstName={firstName} /> : null} />;
}

function EnquiryConfirmation({ firstName }: { firstName: string }) {
  const heading = useFocusOnMount<HTMLHeadingElement>();
  return (
    <div className="flex flex-col items-start gap-4" role="status">
      <SuccessCheck />
      <h3 ref={heading} tabIndex={-1} className="display-sm focus:outline-none">
        Thank you{firstName ? `, ${firstName}` : ""}. Your enquiry is with Manisha&apos;s team.
      </h3>
      <p className="text-muted">
        The next step is a briefing call to understand your people, goals and context. We&apos;ll be in touch using the
        details you shared to set it up.
      </p>
      <p className="text-muted">
        Want to add something in the meantime? Email{" "}
        <a
          href={`mailto:${site.contact.email}`}
          className="font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4"
        >
          {site.contact.email}
        </a>
        .
      </p>
    </div>
  );
}
