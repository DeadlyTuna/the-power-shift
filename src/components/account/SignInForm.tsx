"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { emailField } from "@/lib/validation";
import { SIGN_UP_PATH, authHref, safeNextPath } from "@/lib/demo-auth/next-path";
import { isRealAuth } from "@/lib/supabase/env";
import { Button } from "@/components/ui/Button";
import { FormAlert, TextField } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { AuthHeading, AuthSkeleton, DemoNote } from "./AuthCard";
import { RedirectingPanel, SignedInPanel, destinationLabel } from "./SignedInPanel";
import { useStudent } from "./StudentProvider";
import { firstName } from "./student-utils";

const ID = "signin";
const ALERT_ID = "signin-alert";
const TITLE = "Sign in";
const INTRO = "Sign in to see your courses and carry on from your last lesson.";

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

/** Demo sign-in. Reads ?next= (same-site paths only) and goes there afterwards. */
export function SignInForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const { ready, student, signIn } = useStudent();
  const [status, setStatus] = useState<"idle" | "pending" | "success">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<{ title: string; message: string } | null>(null);

  // Move focus to the error summary after a failed attempt (a new object each time, so it refocuses on repeats).
  useEffect(() => {
    if (formError) document.getElementById(ALERT_ID)?.focus();
  }, [formError]);

  function clearError(name: string) {
    if (!errors[name]) return;
    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle") return;

    const form = new FormData(event.currentTarget);
    const email = emailField.safeParse(String(form.get("email") ?? ""));
    const password = String(form.get("password") ?? "");

    const fieldErrors: Record<string, string> = {};
    if (!email.success) fieldErrors.email = email.error.issues[0]?.message ?? "Enter your email address";
    if (!password) fieldErrors.password = "Enter your password";
    if (!email.success || !password) {
      setErrors(fieldErrors);
      setFormError({ title: "You're not signed in yet", message: "Check the fields marked below." });
      return;
    }

    setStatus("pending");
    setFormError(null);
    const result = await signIn({ email: email.data, password });
    if (!result.ok) {
      setStatus("idle");
      setErrors({});
      setFormError({
        title: "We couldn't sign you in",
        message:
          result.field === "password"
            ? `${result.error} Check for typos (the eye button shows your password), or create an account if you haven't made one here yet.`
            : result.error,
      });
      return;
    }

    setStatus("success");
    toast.success(result.student ? `Welcome back, ${firstName(result.student.name)}` : "Welcome back");
    router.replace(next);
  }

  // While signing in, the store updates before `status` does: keep showing the form until we're done.
  const view = !ready
    ? "loading"
    : status === "success"
      ? "success"
      : status === "idle" && student
        ? "signed-in"
        : "form";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {view === "loading" ? (
        <motion.div key="loading" {...fade}>
          <AuthSkeleton title={TITLE} intro={INTRO} />
        </motion.div>
      ) : view === "success" ? (
        <motion.div key="success" {...fade}>
          <RedirectingPanel title="You're signed in" destination={destinationLabel(next)} />
        </motion.div>
      ) : view === "signed-in" && student ? (
        <motion.div key="signed-in" {...fade}>
          <SignedInPanel student={student} next={next} />
        </motion.div>
      ) : (
        <motion.div key="form" {...fade}>
          <form
            noValidate
            onSubmit={handleSubmit}
            onChange={(e) => {
              const field: EventTarget = e.target;
              if (field instanceof HTMLInputElement) clearError(field.name);
            }}
            aria-labelledby={`${ID}-title`}
            className="flex flex-col gap-6"
          >
            <AuthHeading id={`${ID}-title`} title={TITLE} intro={INTRO} />
            <DemoNote />

            <AnimatePresence initial={false}>
              {formError ? (
                <motion.div
                  key="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <FormAlert id={ALERT_ID} title={formError.title}>
                    {formError.message}
                  </FormAlert>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <TextField
              idPrefix={ID}
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              placeholder="name@example.com"
              error={errors.email}
            />
            <PasswordField idPrefix={ID} name="password" label="Password" purpose="current" error={errors.password} />

            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                size="lg"
                arrow={status === "idle"}
                disabled={status !== "idle"}
                className="w-full sm:w-auto sm:self-start"
              >
                {status === "pending" ? "Signing in…" : "Sign in"}
              </Button>
              <p aria-live="polite" className="sr-only">
                {status === "pending" ? "Signing you in" : ""}
              </p>
              <p className="text-[0.9375rem] text-muted">
                New here?{" "}
                <Link
                  href={authHref(SIGN_UP_PATH, next)}
                  className="font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900"
                >
                  Create an account
                </Link>
              </p>
              {isRealAuth ? (
                <p className="text-sm text-muted">
                  <Link
                    href="/account/forgot-password"
                    className="font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900"
                  >
                    Forgot your password?
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-muted">
                  Forgot your password? Demo accounts can&rsquo;t be recovered, so create a new one with a different email.
                </p>
              )}
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
