"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { site, whatsappLink } from "@/content/site";
import { postJSON } from "@/lib/http";
import { track } from "@/lib/analytics";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxField, FormAlert, Honeypot, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { WhatsAppIcon } from "@/components/ui/icons";
import { FormSwap, SuccessCheck, useFocusOnMount } from "./FormMotion";
import { contactTopicOptions, MESSAGE_MAX, type ContactTopic } from "./schema";

const ID = "contact";
const ALERT_ID = "contact-form-alert";

const messageHints: Partial<Record<ContactTopic, string>> = {
  programs: "Tell us which program you're curious about, or what you'd like help with.",
  corporate: "Tell us about your team, what you'd like to work on, and your rough timing.",
  merch: "Include your order reference if you have one.",
};

/** Contact form → POST /api/contact. Shows inline errors from the API and a success state. */
export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<{ message: string } | null>(null);
  const [sentTo, setSentTo] = useState<{ firstName: string } | null>(null);
  const [topic, setTopic] = useState<ContactTopic | "">("");
  const [honeypot, setHoneypot] = useState("");
  /** Set after "Send another message", so the fresh form takes focus when it appears. */
  const [again, setAgain] = useState(false);

  // Move focus to the error summary after a failed submit (a new object each time, so it refocuses on repeats).
  useEffect(() => {
    if (formError) document.getElementById(ALERT_ID)?.focus();
  }, [formError]);

  function clearError(name: string) {
    if (!errors[name]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "");
    const payload = {
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      topic: text("topic"),
      message: text("message"),
      consent: form.get("consent") === "on",
      website: honeypot,
    };

    setPending(true);
    setFormError(null);
    const result = await postJSON("/api/contact", payload);
    setPending(false);

    if (result.ok) {
      setErrors({});
      track("Contact", { topic: payload.topic });
      setSentTo({ firstName: payload.name.trim().split(/\s+/)[0] ?? "" });
      return;
    }
    setErrors(result.fields ?? {});
    setFormError({ message: result.error });
  }

  const form = (
    <form
      noValidate
      onSubmit={handleSubmit}
      onChange={(e) => {
        const field: EventTarget = e.target;
        if (
          field instanceof HTMLInputElement ||
          field instanceof HTMLSelectElement ||
          field instanceof HTMLTextAreaElement
        ) {
          clearError(field.name);
        }
      }}
      aria-labelledby="contact-form-title"
      className="relative flex flex-col gap-6"
    >
      <div>
        <FormTitle focusOnMount={again} />
        <p className="mt-2 text-muted">All fields are required unless marked optional.</p>
      </div>

      {formError ? (
        <FormAlert id={ALERT_ID} title="Your message wasn't sent">
          {formError.message}
        </FormAlert>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField idPrefix={ID} name="name" label="Your name" autoComplete="name" error={errors.name} />
        <TextField
          idPrefix={ID}
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          error={errors.email}
        />
      </div>

      <TextField
        idPrefix={ID}
        name="phone"
        type="tel"
        label="Mobile number"
        optional
        hint="Add it if you'd like a call or a WhatsApp reply."
        autoComplete="tel"
        inputMode="tel"
        placeholder="98765 43210"
        error={errors.phone}
      />

      <SelectField
        idPrefix={ID}
        name="topic"
        label="What's it about?"
        options={contactTopicOptions}
        value={topic}
        onChange={(e) => setTopic(e.target.value as ContactTopic | "")}
        error={errors.topic}
      />

      <TextAreaField
        idPrefix={ID}
        name="message"
        label="Your message"
        hint={topic ? messageHints[topic] : undefined}
        rows={5}
        maxLength={MESSAGE_MAX}
        error={errors.message}
      />

      <CheckboxField
        idPrefix={ID}
        name="consent"
        error={errors.consent}
        label={
          <>
            I agree that {site.brand} can use these details to reply to my message, as described in the{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900"
            >
              privacy policy
            </Link>
            .
          </>
        }
      />

      <Honeypot value={honeypot} onChange={setHoneypot} />

      <div>
        <Button type="submit" size="lg" arrow={!pending} disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending…" : "Send message"}
        </Button>
        <p aria-live="polite" className="sr-only">
          {pending ? "Sending your message" : ""}
        </p>
      </div>
    </form>
  );

  return (
    <FormSwap
      done={sentTo !== null}
      form={form}
      success={
        sentTo ? (
          <ContactSuccess
            firstName={sentTo.firstName}
            onSendAnother={() => {
              setAgain(true);
              setSentTo(null);
            }}
          />
        ) : null
      }
    />
  );
}

function FormTitle({ focusOnMount }: { focusOnMount: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  // Decided once, on mount: the form remounts each time it comes back.
  const [focusNow] = useState(focusOnMount);
  useEffect(() => {
    if (focusNow) ref.current?.focus();
  }, [focusNow]);
  return (
    <h2 ref={ref} id="contact-form-title" tabIndex={-1} className="display-sm focus:outline-none">
      Send a message
    </h2>
  );
}

function ContactSuccess({ firstName, onSendAnother }: { firstName: string; onSendAnother: () => void }) {
  const heading = useFocusOnMount<HTMLHeadingElement>();
  return (
    <div>
      <SuccessCheck size="lg" />
      <h2 ref={heading} tabIndex={-1} className="display-sm mt-5 focus:outline-none">
        Message sent
      </h2>
      <p className="mt-3 leading-relaxed">
        Thank you{firstName ? `, ${firstName}` : ""}. Your message has reached {site.coach}&rsquo;s team, and we&rsquo;ll
        get back to you. Our hours are {site.contact.hours}.
      </p>
      <p className="mt-3 leading-relaxed text-muted">If it&rsquo;s urgent, message us on WhatsApp as well.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <ButtonLink href={whatsappLink()} variant="outline" icon={<WhatsAppIcon />}>
          Message us on WhatsApp
        </ButtonLink>
        <Button variant="link" onClick={onSendAnother} className="min-h-11 self-start sm:self-auto">
          Send another message
        </Button>
      </div>
    </div>
  );
}
