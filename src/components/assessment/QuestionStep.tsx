"use client";

import { useRef, useState, type KeyboardEvent, type Ref } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { answerOptions, assessmentCopy, statements, type AnswerValue, type Statement } from "@/content/assessment";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";

/**
 * One statement per screen. The answer options are a single-select
 * radiogroup with a roving tab stop: arrow keys / Home / End move focus,
 * Space or Enter selects, and 1 / 2 / 3 select directly from anywhere on the step.
 */

type QuestionStepProps = {
  index: number;
  statement: Statement;
  value: AnswerValue | undefined;
  onChoose: (value: AnswerValue) => void;
  onBack: () => void;
  onNext: () => void;
  headingRef: Ref<HTMLHeadingElement>;
};

export function QuestionStep({ index, statement, value, onChoose, onBack, onNext, headingRef }: QuestionStepProps) {
  const total = statements.length;
  const position = index + 1;
  const headingId = `statement-${statement.id}-heading`;

  function onStepKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const choice = Number(event.key);
    if (Number.isInteger(choice) && choice >= 1 && choice <= answerOptions.length) {
      event.preventDefault();
      onChoose(answerOptions[choice - 1].value);
    }
  }

  return (
    <div onKeyDown={onStepKeyDown} className="bg-paper">
      <Container className="max-w-3xl pt-8 pb-20 sm:pt-12 md:pb-28">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="eyebrow text-marigold-700">{assessmentCopy.title}</h1>
          <p className="shrink-0 text-[0.9375rem] font-semibold text-jamun-900 tabular-nums">
            Statement {position} of {total}
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Assessment progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={position}
          aria-valuetext={`Statement ${position} of ${total}`}
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-jamun-100"
        >
          <div
            className="h-full rounded-full bg-jamun-900 transition-[width] duration-300 ease-shift"
            style={{ width: `${(position / total) * 100}%` }}
          />
        </div>

        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="display-sm sm:display-md mt-10 min-h-[4.8em] scroll-mt-28 focus-visible:shadow-none focus-visible:outline-none sm:mt-14 sm:min-h-[3.4em]"
        >
          <span className="sr-only">
            Statement {position} of {total}:{" "}
          </span>
          {statement.text}
        </h2>
        <p className="mt-4 text-muted" id={`${headingId}-prompt`}>
          How often is this true for you?
        </p>

        <OptionGroup
          key={statement.id}
          value={value}
          onChoose={onChoose}
          labelledBy={headingId}
          describedBy={`${headingId}-prompt`}
        />

        <div className="mt-10 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" className="min-h-11" icon={<ArrowLeft aria-hidden="true" />} onClick={onBack}>
            Back
          </Button>
          <NextButton key={statement.id} answered={value !== undefined} isLast={position === total} onNext={onNext} />
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:justify-between">
          <p className="flex items-start gap-2">
            <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>Saved in this browser as you go. Nothing is sent anywhere unless you choose to.</span>
          </p>
          <p className="hidden md:block">Tip: press 1, 2 or 3 to answer.</p>
        </div>
      </Container>
    </div>
  );
}

/**
 * Shown only when the person arrives on a statement they already answered
 * (after going Back), so it never flashes during the auto-advance.
 */
function NextButton({ answered, isLast, onNext }: { answered: boolean; isLast: boolean; onNext: () => void }) {
  const [answeredOnArrival] = useState(answered);
  if (!answeredOnArrival || !answered) return null;
  return (
    <Button variant="dark" size="sm" className="min-h-11" arrow onClick={onNext}>
      {isLast ? "Continue" : "Next statement"}
    </Button>
  );
}

function OptionGroup({
  value,
  onChoose,
  labelledBy,
  describedBy,
}: {
  value: AnswerValue | undefined;
  onChoose: (value: AnswerValue) => void;
  labelledBy: string;
  describedBy: string;
}) {
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = answerOptions.findIndex((o) => o.value === value);
  const [stop, setStop] = useState(selectedIndex === -1 ? 0 : selectedIndex);
  const tabStop = selectedIndex === -1 ? stop : selectedIndex;

  function focusOption(i: number) {
    setStop(i);
    optionRefs.current[i]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const count = answerOptions.length;
    const current = optionRefs.current.findIndex((el) => el === document.activeElement);
    const from = current === -1 ? tabStop : current;
    let next: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (from + 1) % count;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (from - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next !== null) {
      event.preventDefault();
      focusOption(next);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onKeyDown={onKeyDown}
      className="mt-6 grid gap-3 sm:grid-cols-3"
    >
      {answerOptions.map((option, i) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              optionRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={i === tabStop ? 0 : -1}
            onFocus={() => setStop(i)}
            onClick={() => onChoose(option.value)}
            className={cn(
              "flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition-colors duration-150",
              checked
                ? "border-jamun-900 bg-jamun-900 text-white"
                : "border-line bg-white text-jamun-900 hover:border-jamun-200 hover:bg-white active:bg-mist",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                checked ? "border-marigold-400" : "border-jamun-200",
              )}
            >
              {checked ? <span className="size-2.5 rounded-full bg-marigold-400" /> : null}
            </span>
            <span className="flex-1">{option.label}</span>
            <kbd
              aria-hidden="true"
              className={cn(
                "hidden rounded-md border px-1.5 font-sans text-xs leading-5 font-semibold md:inline-block",
                checked ? "border-white/30 text-jamun-100" : "border-line text-muted",
              )}
            >
              {i + 1}
            </kbd>
          </button>
        );
      })}
    </div>
  );
}
