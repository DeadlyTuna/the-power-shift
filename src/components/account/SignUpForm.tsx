"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { site } from "@/content/site";
import { emailField, fieldErrors, nameField, phoneField } from "@/lib/validation";
import { MIN_PASSWORD_LENGTH } from "@/lib/demo-auth/store";
import { SIGN_IN_PATH, authHref, safeNextPath } from "@/lib/demo-auth/next-path";
import { Button } from "@/components/ui/Button";
import { CheckboxField, FormAlert, TextField } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { AuthHeading, AuthSkeleton, DemoNote } from "./AuthCard";
import { RedirectingPanel, SignedInPanel, destinationLabel } from "./SignedInPanel";
import { useStudent } from "./StudentProvider";
import { firstName } from "./student-utils";

const ID = "signup";
const ALERT_ID = "signup-alert";
const TITLE = "Create account";
const INTRO = "Create a free student account to enrol in courses and keep track of your lessons.";

const details = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  consent: z.literal(true, { error: "Tick this box to create your demo account" }),
});

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

const linkClass =
  "font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900";

/** Demo create-account form. Reads ?next= (same-site paths only) and goes there afterwards. */
export function SignUpForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const { ready, student, signUp } = useStudent();
  const [status, setStatus] = useState<"idle" | "pending" | "success">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<{ title: string; message: string; signInLink?: boolean } | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

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
    const parsed = details.safeParse({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      consent: form.get("consent") === "on",
    });

    const found: Record<string, string> = parsed.success ? {} : fieldErrors(parsed.error);
    if (password.length < MIN_PASSWORD_LENGTH) {
      found.password = password ? `Use at least ${MIN_PASSWORD_LENGTH} characters` : "Choose a password";
    }
    if (!confirm) found.confirm = "Type your password again";
    else if (confirm !== password) found.confirm = "These passwords don't match. Type the same password in both boxes.";

    if (!parsed.success || Object.keys(found).length > 0) {
      setErrors(found);
      setFormError({ title: "Your account wasn't created", message: "Check the fields marked below." });
      return;
    }

    setStatus("pending");
    setFormError(null);
    const result = await signUp({ ...parsed.data, password });
    if (!result.ok) {
      setStatus("idle");
      setErrors(result.field ? { [result.field]: result.error } : {});
      setFormError({
        title: "Your account wasn't created",
        message: result.error,
        signInLink: result.field === "email",
      });
      return;
    }

    setStatus("success");
    toast.success(`Account created. Welcome, ${firstName(result.student.name)}!`);
    router.replace(next);
  }

  const view = !ready
    ? "loading"
    : status === "success"
      ? "success"
      : status === "idle" && student
        ? "signed-in"
        : "form";

  const passwordsMatch = confirm.length > 0 && confirm === password;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {view === "loading" ? (
        <motion.div key="loading" {...fade}>
          <AuthSkeleton title={TITLE} intro={INTRO} />
        </motion.div>
      ) : view === "success" ? (
        <motion.div key="success" {...fade}>
          <RedirectingPanel title="Your account is ready" destination={destinationLabel(next)} />
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
                    {formError.signInLink ? (
                      <>
                        {" "}
                        <Link href={authHref(SIGN_IN_PATH, next)} className={linkClass}>
                          Go to sign in
                        </Link>
                      </>
                    ) : null}
                  </FormAlert>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <TextField idPrefix={ID} name="name" label="Full name" autoComplete="name" error={errors.name} />
            <div className="grid gap-6 sm:grid-cols-2">
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
              <TextField
                idPrefix={ID}
                name="phone"
                type="tel"
                label="Mobile number"
                autoComplete="tel"
                inputMode="tel"
                placeholder="98765 43210"
                error={errors.phone}
              />
            </div>

            <PasswordField
              idPrefix={ID}
              name="password"
              label="Password"
              purpose="new"
              showStrength
              minLength={MIN_PASSWORD_LENGTH}
              hint={`At least ${MIN_PASSWORD_LENGTH} characters. Longer is stronger.`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <PasswordField
              idPrefix={ID}
              name="confirm"
              label="Confirm password"
              purpose="new"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
              footer={
                <AnimatePresence initial={false}>
                  {passwordsMatch && !errors.confirm ? (
                    <motion.p
                      key="match"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <span className="flex items-center gap-1.5 pt-2 text-sm font-medium text-peacock-700">
                        <CircleCheck aria-hidden="true" className="size-4" />
                        Passwords match
                      </span>
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              }
            />

            <CheckboxField
              idPrefix={ID}
              name="consent"
              error={errors.consent}
              label={
                <>
                  I understand this demo account is saved only in this browser, and I agree to the{" "}
                  <Link href="/terms" className={linkClass}>
                    terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className={linkClass}>
                    privacy policy
                  </Link>{" "}
                  of {site.brand}.
                </>
              }
            />

            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                size="lg"
                arrow={status === "idle"}
                disabled={status !== "idle"}
                className="w-full sm:w-auto sm:self-start"
              >
                {status === "pending" ? "Creating account…" : "Create account"}
              </Button>
              <p aria-live="polite" className="sr-only">
                {status === "pending" ? "Creating your account" : ""}
              </p>
              <p className="text-[0.9375rem] text-muted">
                Already have an account?{" "}
                <Link href={authHref(SIGN_IN_PATH, next)} className={linkClass}>
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
