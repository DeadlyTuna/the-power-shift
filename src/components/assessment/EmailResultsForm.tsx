"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Band } from "@/content/assessment";
import { Button } from "@/components/ui/Button";
import { CheckboxField, FormAlert, Honeypot, TextField } from "@/components/ui/Field";
import { track } from "@/lib/analytics";
import type { Answers } from "@/lib/assessment/scoring";
import { postJSON } from "@/lib/http";

/**
 * Optional: send the results to the person's inbox (and to Manisha's team).
 * The server recomputes everything from the raw answers.
 */

type Status = "idle" | "pending" | "success";

export function EmailResultsForm({
  answers,
  focusId,
  bandId,
}: {
  answers: Answers;
  focusId: number | null;
  bandId: Band["id"];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<{ message: string; attempt: number } | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [sentTo, setSentTo] = useState("");

  const alertRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Move focus to the error summary after each failed attempt so it is announced.
  useEffect(() => {
    if (error) alertRef.current?.focus();
  }, [error]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending") return;
    setStatus("pending");
    setFields({});

    const res = await postJSON<{ band: string }>("/api/assessment", {
      answers,
      focusId,
      name,
      email,
      phone,
      consent,
      website,
    });

    if (res.ok) {
      setStatus("success");
      setError(null);
      setSentTo(email.trim());
      track("Lead", { source: "assessment", band: bandId });
      return;
    }

    setStatus("idle");
    setFields(res.fields ?? {});
    setError((prev) => ({ message: res.error, attempt: (prev?.attempt ?? 0) + 1 }));
  }

  if (status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} className="focus-visible:shadow-none focus-visible:outline-none">
        <FormAlert tone="success" title={`Thank you, ${name.trim().split(/\s+/)[0]}.`}>
          {/* TODO(client): the LEADS_WEBHOOK_URL automation must send this email for the promise below to hold. */}
          Your results are on their way to {sentTo}. You can also save this page as a PDF to keep a copy now.
        </FormAlert>
      </div>
    );
  }

  const pending = status === "pending";
  const answerError = Object.keys(fields).some((k) => k.startsWith("answers") || k === "focusId");

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-5" aria-busy={pending}>
      {error ? (
        <div ref={alertRef} tabIndex={-1} className="focus-visible:shadow-none focus-visible:outline-none">
          <FormAlert key={error.attempt} title="Your results weren't sent">
            {answerError
              ? "Your answers look incomplete. Retake the assessment, then try again."
              : error.message}
          </FormAlert>
        </div>
      ) : null}

      <TextField
        idPrefix="results"
        name="name"
        label="Your name"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fields.name}
      />
      <TextField
        idPrefix="results"
        name="email"
        type="email"
        inputMode="email"
        label="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fields.email}
      />
      <TextField
        idPrefix="results"
        name="phone"
        type="tel"
        inputMode="tel"
        label="WhatsApp number"
        hint="If you'd also like a follow-up on WhatsApp."
        optional
        autoComplete="tel"
        placeholder="98765 43210"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={fields.phone}
      />
      <CheckboxField
        idPrefix="results"
        name="consent"
        checked={consent}
        onChange={(e) => setConsent(e.target.checked)}
        error={fields.consent}
        label={
          <>
            Email me my results. I agree that Manisha Agrawal&apos;s team may store these details and contact me about
            them, as described in the{" "}
            <Link href="/privacy-policy" className="font-semibold text-jamun-900 underline underline-offset-4">
              privacy policy
            </Link>
            .
          </>
        }
      />
      <Honeypot value={website} onChange={setWebsite} />

      <div>
        <Button type="submit" variant="dark" size="lg" arrow disabled={pending}>
          {pending ? "Sending…" : "Email me my results"}
        </Button>
        <p aria-live="polite" className="sr-only">
          {pending ? "Sending your results" : ""}
        </p>
      </div>
    </form>
  );
}
