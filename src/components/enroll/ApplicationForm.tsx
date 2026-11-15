"use client";

import { useState, type FormEvent } from "react";
import { CalendarCheck } from "lucide-react";
import type { Program } from "@/content/programs";
import { site } from "@/content/site";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Honeypot, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { track } from "@/lib/analytics";
import { postJSON } from "@/lib/http";
import { changedFieldName, textValue, useFormState } from "./form-state";
import { heardFromOptions } from "./options";
import { ConsentField, ContactFields, FinePrint, FormMessage, SuccessPanel } from "./parts";
import { useHydrated } from "./use-now";

/**
 * Application for ongoing programs (mode "application"): POST /api/apply,
 * then an inline confirmation with the next step, the clarity call.
 */

const FIELDS = ["name", "email", "phone", "role", "change", "heardFrom", "consent"] as const;

export function ApplicationForm({
  program,
  source,
  idPrefix,
}: {
  program: Program;
  source?: string;
  idPrefix: string;
}) {
  const hydrated = useHydrated();
  const [honeypot, setHoneypot] = useState("");
  const [applicant, setApplicant] = useState<string | null>(null);
  const alertId = `${idPrefix}-alert`;
  const form = useFormState(alertId, FIELDS);

  if (applicant !== null) {
    return (
      <SuccessPanel title="Application received.">
        <p>
          Thank you{applicant ? `, ${applicant}` : ""}. Manisha&apos;s team will reach out to schedule your clarity
          call, where you&apos;ll look at your goals together and decide whether {program.shortTitle} is the right fit.
        </p>
        {site.bookingUrl ? (
          <>
            <p>Prefer to pick a time yourself? Book your clarity call now.</p>
            <div>
              <ButtonLink
                href={site.bookingUrl}
                size="lg"
                arrow
                className="w-full sm:w-auto"
                onClick={() => track("Schedule", { content_name: program.shortTitle, source })}
              >
                Book my clarity call
                {/^https?:/.test(site.bookingUrl) ? <span className="sr-only"> (opens in a new tab)</span> : null}
              </ButtonLink>
            </div>
          </>
        ) : null}
        <p>
          While you wait, the free Power Self-Assessment shows which pattern is holding you back most. It&apos;s a
          useful starting point for your call.
        </p>
        <div>
          <ButtonLink href="/assessment" variant="outline" className="w-full text-balance sm:w-auto">
            Take the free Power Self-Assessment
          </ButtonLink>
        </div>
      </SuccessPanel>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.pending) return;

    const data = new FormData(event.currentTarget);
    const name = textValue(data, "name");
    const body = {
      slug: program.slug,
      name,
      email: textValue(data, "email"),
      phone: textValue(data, "phone"),
      role: textValue(data, "role"),
      change: textValue(data, "change"),
      heardFrom: textValue(data, "heardFrom") || undefined,
      consent: data.get("consent") === "on",
      website: textValue(data, "website"),
      source,
    };

    form.begin();
    const result = await postJSON("/api/apply", body);
    if (!result.ok) return form.fail(result);
    track("Lead", { content_name: program.shortTitle, source });
    form.end();
    setApplicant(name.trim().split(/\s+/)[0] ?? "");
  }

  const busy = form.pending;

  return (
    <form
      method="post"
      noValidate
      onSubmit={onSubmit}
      onChange={(event) => {
        const name = changedFieldName(event.target);
        if (name) form.clearError(name);
      }}
      className="relative flex flex-col gap-5"
    >
      <ContactFields
        idPrefix={idPrefix}
        errors={form.errors}
        phoneHint="Manisha's team will contact you here to schedule your call."
      />
      <TextField
        idPrefix={idPrefix}
        name="role"
        label="Current role"
        hint="For example: Team lead at an IT services company"
        autoComplete="organization-title"
        maxLength={120}
        error={form.errors.role}
      />
      <TextAreaField
        idPrefix={idPrefix}
        name="change"
        label="What would you most like to change?"
        hint="A few lines is plenty."
        maxLength={2000}
        error={form.errors.change}
      />
      <SelectField
        idPrefix={idPrefix}
        name="heardFrom"
        label="How did you hear about Manisha?"
        optional
        options={heardFromOptions}
        defaultValue=""
        error={form.errors.heardFrom}
      />
      <ConsentField
        idPrefix={idPrefix}
        error={form.errors.consent}
        text="I agree to be contacted about my application on WhatsApp, phone and email."
      />
      <Honeypot value={honeypot} onChange={setHoneypot} />

      <FormMessage id={alertId} alert={form.alert} />

      <Button
        type="submit"
        size="lg"
        arrow={!busy}
        disabled={!hydrated}
        aria-disabled={busy || undefined}
        className="w-full"
      >
        {busy ? "Sending your application…" : "Send my application"}
      </Button>
      <p aria-live="polite" className="sr-only">
        {busy ? "Sending your application…" : ""}
      </p>

      <FinePrint icon={<CalendarCheck />}>
        It starts with a free clarity call, where you and Manisha decide together whether this is the right fit.
      </FinePrint>
    </form>
  );
}
