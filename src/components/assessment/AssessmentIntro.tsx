"use client";

import type { Ref } from "react";
import { Lock } from "lucide-react";
import { assessmentCopy, patterns, statements } from "@/content/assessment";
import { Button } from "@/components/ui/Button";
import { Card, Section } from "@/components/ui/Layout";
import { isComplete } from "@/lib/assessment/scoring";
import { answeredCount, type SavedProgress } from "@/lib/assessment/storage";

type AssessmentIntroProps = {
  saved: SavedProgress | null;
  onStart: () => void;
  onResume: (progress: SavedProgress) => void;
  headingRef: Ref<HTMLHeadingElement>;
};

const steps = [
  { title: `Rate ${statements.length} statements`, body: "Often, Sometimes or Rarely. Go with your first answer." },
  { title: "Choose your power focus", body: "Pick the one statement costing you the most today." },
  { title: "See your results", body: "Your power score, your four patterns, and one practice for the next 24 hours." },
];

export function AssessmentIntro({ saved, onStart, onResume, headingRef }: AssessmentIntroProps) {
  const answered = saved ? answeredCount(saved.answers) : 0;
  const finished = Boolean(saved && saved.stage === "results" && isComplete(saved.answers));
  const hasProgress = Boolean(saved && (answered > 0 || finished));

  return (
    <Section tone="paper" className="pt-12 md:pt-20">
      <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow text-marigold-700">
            Free · {statements.length} statements · about {assessmentCopy.minutes} minutes
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="display-xl mt-4 scroll-mt-28 focus-visible:shadow-none focus-visible:outline-none"
          >
            {assessmentCopy.title}
          </h1>
          <p className="lede mt-6 text-ink">{assessmentCopy.intro}</p>
          <p className="mt-4 max-w-xl text-muted">
            Rate {statements.length} short statements about how you think and act. You&apos;ll see where your power is
            leaking, pick the one statement costing you the most today, and get a small practice to try in the next 24
            hours.
          </p>

          <div className="mt-9" aria-live="polite">
            {hasProgress && saved ? (
              <div className="flex flex-col gap-4">
                <p className="font-semibold text-jamun-900">
                  {finished
                    ? "Your last results are saved in this browser."
                    : `You've answered ${answered} of ${statements.length} statements.`}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" arrow onClick={() => onResume(saved)}>
                    {finished ? "See my last results" : "Continue where I left off"}
                  </Button>
                  <Button size="lg" variant="outline" onClick={onStart}>
                    Start over
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="lg" arrow onClick={onStart} className="w-full sm:w-auto">
                Start the assessment
              </Button>
            )}
          </div>

          <p className="mt-6 flex max-w-xl items-start gap-2.5 text-[0.9375rem] text-muted">
            <Lock aria-hidden="true" className="mt-1 size-4 shrink-0" />
            <span>Your answers stay in this browser unless you choose to email your results.</span>
          </p>
          <noscript>
            <p className="mt-6 rounded-xl border border-line bg-white p-4 text-ink">
              The assessment needs JavaScript. Turn it on in your browser settings, then reload this page.
            </p>
          </noscript>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-6 sm:p-8">
            <h2 className="display-sm">What it looks at</h2>
            <p className="mt-2 text-muted">Four patterns that quietly drain your power, three statements each.</p>
            <ul className="mt-6 divide-y divide-line">
              {patterns.map((p) => (
                <li key={p.id} className="flex flex-col py-3.5 first:pt-0 last:pb-0">
                  <span className="font-semibold text-jamun-900">{p.name}</span>
                  <span className="text-[0.9375rem] text-muted">{p.power}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div>
            <h2 className="eyebrow text-marigold-700">How it works</h2>
            <ol className="mt-4 grid gap-4">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span aria-hidden="true" className="font-display text-2xl leading-none text-marigold-700 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-semibold text-jamun-900">{step.title}</p>
                    <p className="text-[0.9375rem] text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-line pt-6 text-sm text-muted">
        <p className="max-w-3xl">{assessmentCopy.disclaimer}</p>
        <p className="mt-2">{assessmentCopy.copyright}</p>
      </div>
    </Section>
  );
}
