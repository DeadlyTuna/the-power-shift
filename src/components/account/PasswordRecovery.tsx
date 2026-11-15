"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { requestPasswordReset, updatePassword } from "@/lib/auth/supabase-store";
import { MIN_PASSWORD_LENGTH } from "@/lib/demo-auth/store";
import { SIGN_IN_PATH } from "@/lib/demo-auth/next-path";
import { isRealAuth } from "@/lib/supabase/env";
import { emailField } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { FormAlert, TextField } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { AuthHeading } from "./AuthCard";
import { useStudent } from "./StudentProvider";

const linkClass =
  "font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900";

function DemoOnly() {
  return (
    <div className="flex flex-col gap-4">
      <AuthHeading id="recovery-title" title="Password recovery" />
      <p className="text-ink">
        Demo accounts live only in this browser, so their passwords can&rsquo;t be recovered. Create a new account with a
        different email instead.
      </p>
      <Link href="/account/sign-up" className={linkClass}>
        Create an account
      </Link>
    </div>
  );
}

/** Step 1: email a reset link. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<"idle" | "pending" | "sent">("idle");

  if (!isRealAuth) return <DemoOnly />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = emailField.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setStatus("pending");
    const result = await requestPasswordReset(parsed.data);
    if (!result.ok) {
      setStatus("idle");
      setError(result.error);
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-col gap-4">
        <AuthHeading id="recovery-title" title="Check your email" />
        <p className="text-ink">
          If an account exists for <strong className="font-semibold">{email}</strong>, a link to reset your password is
          on its way. It works once and expires after a while.
        </p>
        <Link href={SIGN_IN_PATH} className={linkClass}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} aria-labelledby="recovery-title" className="flex flex-col gap-6">
      <AuthHeading
        id="recovery-title"
        title="Reset your password"
        intro="Enter the email you signed up with and we'll send you a link to choose a new password."
      />
      <TextField
        idPrefix="forgot"
        name="email"
        type="email"
        autoComplete="email"
        label="Email"
        placeholder="name@example.com"
        value={email}
        error={error}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(undefined);
        }}
      />
      <Button type="submit" size="lg" arrow disabled={status === "pending"}>
        {status === "pending" ? "Sending link…" : "Send reset link"}
      </Button>
      <Link href={SIGN_IN_PATH} className={`${linkClass} text-[0.9375rem]`}>
        Back to sign in
      </Link>
    </form>
  );
}

/** Step 2: the reset link signs the student in; they choose a new password here. */
export function UpdatePasswordForm() {
  const router = useRouter();
  const { ready, student } = useStudent();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  if (!isRealAuth) return <DemoOnly />;
  if (!ready) return <p className="text-muted">Checking your reset link…</p>;
  if (!student) {
    return (
      <div className="flex flex-col gap-4">
        <AuthHeading id="recovery-title" title="This link has expired" />
        <p className="text-ink">Reset links work once and expire after a while. Request a new one to continue.</p>
        <Link href="/account/forgot-password" className={linkClass}>
          Send a new reset link
        </Link>
      </div>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setPending(true);
    const result = await updatePassword(password);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Password updated");
    router.replace("/account");
  }

  return (
    <form noValidate onSubmit={submit} aria-labelledby="recovery-title" className="flex flex-col gap-6">
      <AuthHeading id="recovery-title" title="Choose a new password" intro={`Signed in as ${student.email}.`} />
      {error ? <FormAlert title="Your password wasn't changed">{error}</FormAlert> : null}
      <PasswordField
        idPrefix="update"
        name="password"
        label="New password"
        purpose="new"
        showStrength
        value={password}
        error={error}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(undefined);
        }}
      />
      <Button type="submit" size="lg" arrow disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
