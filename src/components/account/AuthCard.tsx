import type { ReactNode } from "react";
import { Check, FlaskConical } from "lucide-react";
import { statements } from "@/content/assessment";
import { BorderBeam } from "@/components/kit/border-beam";
import { DotPattern } from "@/components/kit/dot-pattern";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";
import { Card, Section } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { cn } from "@/lib/cn";
import { isRealAuth } from "@/lib/supabase/env";

/**
 * Building blocks for the demo sign-in and create-account pages: a calm
 * two-column layout (form card + brand panel), the shared heading, the demo
 * notice and a loading skeleton. No hooks here, so the skeleton can be the
 * server-rendered Suspense fallback.
 */

/** A slow marigold light travelling round a card's border. Hidden when motion is reduced. */
export function QuietBeam({ duration = 9 }: { duration?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] motion-reduce:hidden">
      <BorderBeam size={140} duration={duration} borderWidth={1.5} colorFrom="#f2a93b" colorTo="#fbe3b8" />
    </div>
  );
}

export function AuthShell({ panel, children }: { panel: "sign-in" | "sign-up"; children: ReactNode }) {
  return (
    <Section tone="paper" className="relative overflow-hidden pt-8 pb-20 md:pt-14 md:pb-24">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
        <Reveal from="up" amount={0.05}>
          <Card className="relative h-full p-6 shadow-[0_24px_60px_-40px_rgba(42,22,54,0.45)] sm:p-10">
            <QuietBeam />
            {children}
          </Card>
        </Reveal>
        <Reveal from="right" delay={0.12} amount={0.05}>
          <BrandPanel variant={panel} />
        </Reveal>
      </div>
    </Section>
  );
}

export function AuthHeading({
  id,
  eyebrow = "Student area",
  title,
  intro,
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow text-marigold-700">{eyebrow}</p>
      <h1 id={id} className="display-md mt-3" tabIndex={-1}>
        {title}
      </h1>
      {intro ? <p className="mt-3 text-muted">{intro}</p> : null}
    </div>
  );
}

/** The plain-language notice that this is a browser-only demo (hidden once real accounts are configured). */
export function DemoNote({ className }: { className?: string }) {
  if (isRealAuth) return null;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-marigold-300 bg-marigold-200/45 px-4 py-3 text-[0.9375rem] leading-snug text-jamun-950",
        className,
      )}
    >
      <FlaskConical aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-marigold-700" />
      <p>
        <strong className="font-semibold">This is a demo.</strong> Accounts are stored only in this browser, so use any
        test details and don&rsquo;t reuse a real password.
      </p>
    </div>
  );
}

/** Neutral placeholder while the browser-only account state loads. */
export function AuthSkeleton({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <AuthHeading title={title} intro={intro} />
      <DemoNote />
      <div className="flex flex-col gap-5" aria-hidden="true">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-4 w-24 animate-pulse rounded bg-mist" />
            <div className="h-[3.25rem] animate-pulse rounded-xl bg-mist" />
          </div>
        ))}
        <div className="h-14 w-40 animate-pulse rounded-full bg-mist" />
      </div>
      <p className="sr-only">Loading</p>
      <noscript>
        <p className="font-medium text-kumkum">
          The demo student area needs JavaScript. Turn it on in your browser settings, then reload this page.
        </p>
      </noscript>
    </div>
  );
}

const panels = {
  "sign-in": {
    title: "Pick up where you left off",
    script: "I'll start when I feel ready.",
    points: ["Your courses in one place", "Lessons marked off as you finish them", "Come back to any lesson, any time"],
  },
  "sign-up": {
    title: "Learn at your own pace",
    script: "I'll deal with it later.",
    points: ["Short video lessons with practical exercises", "Progress saved as you go", "Start with a free preview lesson"],
  },
} as const;

function BrandPanel({ variant }: { variant: "sign-in" | "sign-up" }) {
  const copy = panels[variant];
  const statement = statements.find((s) => s.script === copy.script);
  return (
    <aside
      aria-labelledby={`${variant}-panel-title`}
      data-tone="jamun"
      className="relative isolate flex h-full flex-col justify-between gap-10 overflow-hidden rounded-card bg-jamun-900 p-7 text-jamun-100 sm:p-10"
    >
      <DotPattern
        width={22}
        height={22}
        cr={1.1}
        className="-z-10 text-jamun-700 [mask-image:radial-gradient(70%_60%_at_85%_10%,#000_10%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 -bottom-24 -z-10 size-72 rounded-full bg-marigold-400/15 blur-3xl"
      />
      <div>
        <p className="eyebrow text-marigold-300">The Power Shift courses</p>
        <h2 id={`${variant}-panel-title`} className="display-md mt-3 text-white">
          {copy.title}
        </h2>
        <StaggerList className="mt-6 flex flex-col gap-3" stagger={0.1}>
          {copy.points.map((point) => (
            <StaggerListItem key={point} className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-marigold-400 text-jamun-950">
                <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
              </span>
              <span>{point}</span>
            </StaggerListItem>
          ))}
        </StaggerList>
      </div>
      {statement ? (
        <Reframe
          tone="dark"
          size="md"
          script={statement.script}
          shift={statement.shift}
          className="border-l-2 border-marigold-400 pl-5"
        />
      ) : null}
    </aside>
  );
}
