"use client";

import { useState, type FormEvent, type Ref } from "react";
import { ArrowLeft } from "lucide-react";
import { assessmentCopy, statements, type Statement } from "@/content/assessment";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";

/**
 * "Your power focus": of the statements marked Often (or Sometimes, when
 * nothing was Often), the person picks the one costing them the most today.
 */

type FocusStepProps = {
  candidates: Statement[];
  basis: "often" | "sometimes";
  value: number | null;
  onChange: (id: number) => void;
  /** Called with the chosen statement id. */
  onSubmit: (focusId: number) => void;
  onSkip: () => void;
  onBack: () => void;
  headingRef: Ref<HTMLHeadingElement>;
};

export function FocusStep({ candidates, basis, value, onChange, onSubmit, onSkip, onBack, headingRef }: FocusStepProps) {
  const [showError, setShowError] = useState(false);
  const single = candidates.length === 1;

  const prompt = single
    ? `You marked one statement ${basis === "often" ? "Often" : "Sometimes"}. This is your power focus.`
    : basis === "often"
      ? assessmentCopy.focusPrompt
      : "You didn't mark any statement Often. Look at the ones you marked Sometimes. Choose the one that is costing you the most today.";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const chosen = single ? candidates[0].id : value;
    if (chosen === null) {
      setShowError(true);
      return;
    }
    onSubmit(chosen);
  }

  return (
    <div className="bg-paper">
      <Container className="max-w-3xl pt-8 pb-20 sm:pt-12 md:pb-28">
        <p className="eyebrow text-marigold-700">{assessmentCopy.title}</p>
        <div
          role="progressbar"
          aria-label="Assessment progress"
          aria-valuemin={0}
          aria-valuemax={statements.length}
          aria-valuenow={statements.length}
          aria-valuetext="All statements answered"
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-jamun-900"
        />

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="display-md mt-10 scroll-mt-28 focus-visible:shadow-none focus-visible:outline-none sm:mt-14"
        >
          Your power focus
        </h1>
        <p id="focus-prompt" className="lede mt-4 text-ink">
          {prompt}
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8">
          {single ? (
            <blockquote className="rounded-2xl border-2 border-jamun-900 bg-white p-5 text-lg leading-snug text-jamun-900 sm:p-6">
              {candidates[0].text}
            </blockquote>
          ) : (
            <fieldset aria-describedby={showError && value === null ? "focus-error" : undefined}>
              <legend className="sr-only">Choose the statement costing you the most today</legend>
              <div className="grid gap-3">
                {candidates.map((s) => {
                  const checked = value === s.id;
                  return (
                    <label
                      key={s.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-2xl border-2 bg-white p-5 text-[1.0625rem] leading-snug transition-colors sm:p-6",
                        checked ? "border-jamun-900 text-jamun-900" : "border-line text-ink hover:border-jamun-200",
                      )}
                    >
                      <input
                        type="radio"
                        name="focus"
                        value={s.id}
                        checked={checked}
                        onChange={() => {
                          onChange(s.id);
                          setShowError(false);
                        }}
                        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-jamun-900"
                      />
                      <span className={cn(checked && "font-semibold")}>{s.text}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          <p id="focus-error" role="alert" className="mt-4 min-h-6 text-[0.9375rem] font-medium text-kumkum">
            {showError && value === null ? "Choose the statement costing you the most today, or skip this step." : ""}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" arrow>
              See my results
            </Button>
            {!single ? (
              <Button variant="link" className="min-h-11 self-center sm:ml-3" onClick={onSkip}>
                Skip this step
              </Button>
            ) : null}
          </div>
        </form>

        <div className="mt-12 border-t border-line pt-6">
          <Button variant="outline" size="sm" className="min-h-11" icon={<ArrowLeft aria-hidden="true" />} onClick={onBack}>
            Back to the statements
          </Button>
        </div>
      </Container>
    </div>
  );
}
