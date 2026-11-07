"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Infinity as InfinityIcon, LockKeyhole, UserRound } from "lucide-react";
import { courseLessons } from "@/content/courses";
import type { Program } from "@/content/programs";
import { useEnrollments, useStudent } from "@/components/account/StudentProvider";
import { useDemoCheckout } from "@/components/enroll/DemoCheckout";
import { FinePrint } from "@/components/enroll/parts";
import { Progress } from "@/components/kit/progress";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/Field";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";
import { postJSON } from "@/lib/http";
import { startCheckout, type CheckoutStart } from "@/lib/payments/checkout-client";
import { learnHref, signInHref, signUpHref } from "./course-helpers";
import { PaletteConfetti } from "./PaletteConfetti";

/**
 * Enrollment for a self-paced course, driven by the DEMO student account
 * (src/lib/demo-auth) in this browser:
 *
 *   checking   server render / hydration: a neutral placeholder, no flash
 *   guest      "Create a free account to enroll" (+ sign in)
 *   student    "Enroll for ₹…" → POST /api/checkout/program with the
 *              account's name, email and phone → Razorpay Checkout, the
 *              demo checkout dialog (MOCK courses without Razorpay) or the
 *              hosted payment page → enroll(slug, reference), confetti, toast
 *   enrolled   progress + "Continue learning"
 *
 * The amount is decided by the server from src/content; the browser only
 * sends which course.
 */

type Phase = "creating" | "paying" | "redirecting";
type Alert = { tone: "error" | "info"; title?: string; message: string; retry?: boolean };

const STATE_MOTION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

export function CourseEnrollPanel({
  program,
  source,
  idPrefix,
  className,
}: {
  program: Program;
  /** Recorded with the checkout, e.g. "course-card". */
  source: string;
  /** Unique per panel on the page. */
  idPrefix: string;
  className?: string;
}) {
  const router = useRouter();
  const { ready, student } = useStudent();
  const { isEnrolled, progress, get, enroll } = useEnrollments();
  const demo = useDemoCheckout();

  const [pending, setPending] = useState(false);
  const [phase, setPhase] = useState<Phase>("creating");
  const [alert, setAlert] = useState<Alert | null>(null);
  const [justEnrolled, setJustEnrolled] = useState(false);
  const [celebration, setCelebration] = useState(0);
  const lastCheckout = useRef<{ key: string; start: CheckoutStart } | null>(null);
  const enrolledHeading = useRef<HTMLParagraphElement>(null);
  const alertId = `${idPrefix}-alert`;

  const price = program.price?.amount;
  const priceLabel = price !== undefined ? formatINR(price) : "";
  const totalLessons = courseLessons(program).length;

  const state = !ready ? "checking" : !student ? "guest" : isEnrolled(program.slug) ? "enrolled" : "student";

  // After enrolling, the button that had focus is gone: move focus to the confirmation.
  useEffect(() => {
    if (justEnrolled) enrolledHeading.current?.focus();
  }, [justEnrolled]);

  // Coming back from a hosted payment page via the back button restores the page pending; release it.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setPending(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  function showAlert(next: Alert) {
    setAlert(next);
    setPending(false);
    // Announce and move focus once the alert has rendered.
    requestAnimationFrame(() => document.getElementById(alertId)?.focus());
  }

  async function onEnroll() {
    if (pending || !student) return;
    setPending(true);
    setAlert(null);
    setPhase("creating");

    const key = student.id;
    let start = lastCheckout.current?.key === key ? lastCheckout.current.start : null;
    if (!start) {
      const result = await postJSON<CheckoutStart>("/api/checkout/program", {
        slug: program.slug,
        name: student.name,
        email: student.email,
        phone: student.phone,
        consent: true,
        website: "",
        source,
      });
      if (!result.ok) {
        const details = Object.entries(result.fields ?? {})
          .filter(([field]) => ["name", "email", "phone"].includes(field))
          .map(([, message]) => message);
        showAlert({
          tone: "error",
          message: details.length
            ? `Your account details couldn't be used for checkout. ${details.join(" ")}`
            : result.error,
        });
        return;
      }
      start = result;
      lastCheckout.current = start.mode === "razorpay" || start.mode === "demo" ? { key, start } : null;
    }

    track("InitiateCheckout", { value: price, currency: "INR", content_name: program.shortTitle, source });
    setPhase(start.mode === "link" ? "redirecting" : "paying");
    const current = start;
    const outcome = await startCheckout(current, {
      confirmDemo: (demoStart) => demo.confirm({ item: program.title, amount: price, reference: demoStart.reference }),
    });

    switch (outcome.status) {
      case "paid": {
        lastCheckout.current = null;
        if (!enroll(program.slug, outcome.reference || "free")) {
          showAlert({
            tone: "error",
            title: "Your enrollment couldn't be saved",
            message:
              "This browser is blocking site storage, so the course can't be added to your account. Allow site data for this site, then select Enroll again.",
          });
          return;
        }
        if (outcome.reference) {
          track("Purchase", { value: price, currency: "INR", content_name: program.shortTitle, source });
        }
        setPending(false);
        setJustEnrolled(true);
        setCelebration((n) => n + 1);
        toast.success("You're enrolled", {
          description: `${program.title} is in My courses now.`,
          action: { label: "Go to course", onClick: () => router.push(learnHref(program.slug)) },
        });
        return;
      }
      case "redirected":
        return; // on the way to the hosted payment page
      case "dismissed":
        showAlert({
          tone: "info",
          title: "You're not enrolled yet",
          message:
            current.mode === "demo"
              ? "The demo checkout was closed before it was completed. You'll be enrolled once you complete the demo payment."
              : `The payment window was closed before the payment went through. You'll be enrolled once the ${priceLabel} payment is complete.`,
          retry: true,
        });
        return;
      case "failed":
        showAlert({ tone: "error", message: outcome.error });
        return;
    }
  }

  const pendingLabel =
    phase === "redirecting"
      ? "Opening the payment page…"
      : phase === "paying"
        ? "Waiting for payment…"
        : "Starting checkout…";

  const enrollment = get(program.slug);
  const percent = progress(program.slug, totalLessons);
  const completed = enrollment?.completedLessons.length ?? 0;

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {state === "checking" ? (
          <motion.div key="checking" {...STATE_MOTION} exit={{ opacity: 0 }}>
            <div aria-hidden="true" className="h-14 rounded-full bg-mist" />
            <div aria-hidden="true" className="mx-auto mt-4 h-4 w-2/3 rounded-full bg-mist" />
            <p className="sr-only" role="status">
              Checking your account…
            </p>
          </motion.div>
        ) : null}

        {state === "guest" ? (
          <motion.div key="guest" {...STATE_MOTION} className="flex flex-col gap-4">
            <ButtonLink href={signUpHref(program.slug)} size="lg" arrow className="w-full">
              Create a free account to enroll
            </ButtonLink>
            <p className="text-center text-[0.9375rem] text-muted">
              Already have one?{" "}
              <Link
                href={signInHref(program.slug)}
                className="font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900"
              >
                Sign in
              </Link>
            </p>
            <FinePrint icon={<UserRound />}>Demo accounts are saved in this browser only.</FinePrint>
          </motion.div>
        ) : null}

        {state === "student" && student ? (
          <motion.div key="student" {...STATE_MOTION} className="flex flex-col gap-4">
            {alert ? (
              <FormAlert id={alertId} tone={alert.tone} title={alert.title}>
                <p>{alert.message}</p>
                {alert.retry ? (
                  <Button variant="dark" size="sm" className="mt-3" onClick={onEnroll}>
                    Return to payment
                  </Button>
                ) : null}
              </FormAlert>
            ) : null}
            <motion.div whileTap={pending ? undefined : { scale: 0.98 }}>
              <Button
                size="lg"
                arrow={!pending}
                aria-disabled={pending || undefined}
                onClick={onEnroll}
                className="w-full"
              >
                {pending ? pendingLabel : `Enroll for ${priceLabel}`}
              </Button>
            </motion.div>
            <p aria-live="polite" className="sr-only">
              {pending ? pendingLabel : ""}
            </p>
            <p className="text-center text-sm text-muted">
              Enrolling as <span className="font-semibold text-ink">{student.name}</span>
            </p>
            <div className="flex flex-col gap-2.5">
              <FinePrint icon={<LockKeyhole />}>You&apos;ll see the amount again before anything is charged.</FinePrint>
              <FinePrint icon={<InfinityIcon />}>Lifetime access from the moment you enroll.</FinePrint>
            </div>
          </motion.div>
        ) : null}

        {state === "enrolled" ? (
          <motion.div key="enrolled" {...STATE_MOTION} className="flex flex-col gap-4">
            <div>
              <p
                ref={enrolledHeading}
                tabIndex={-1}
                className="font-display text-[1.375rem] leading-tight text-jamun-900 focus-visible:shadow-none focus-visible:outline-none"
              >
                {justEnrolled ? "You're enrolled" : completed > 0 ? "Welcome back" : "You're enrolled"}
              </p>
              <p className="mt-1 text-[0.9375rem] text-muted">
                {completed} of {totalLessons} lessons complete
              </p>
            </div>
            <Progress
              value={percent}
              aria-label={`Course progress: ${percent}%`}
              className="h-2.5 bg-mist [&_[data-slot=progress-indicator]]:bg-peacock-600 [&_[data-slot=progress-indicator]]:duration-700"
            />
            <ButtonLink href={learnHref(program.slug)} size="lg" arrow className="w-full">
              {justEnrolled ? "Go to course" : completed > 0 ? "Continue learning" : "Start learning"}
            </ButtonLink>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {celebration > 0 ? <PaletteConfetti key={celebration} /> : null}
      {demo.dialog}
    </div>
  );
}
