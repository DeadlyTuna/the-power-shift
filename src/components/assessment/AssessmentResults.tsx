"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { RotateCcw } from "lucide-react";
import { assessmentCopy } from "@/content/assessment";
import { getProgram } from "@/content/programs";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, Container, Section, SectionHeading } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { HIGH_LEAK_TOTAL, type Answers, type AssessmentResult, type PatternLevel } from "@/lib/assessment/scoring";
import { cn } from "@/lib/cn";
import { EmailResultsForm } from "./EmailResultsForm";
import { PowerGauge } from "./PowerGauge";
import { ResultActions } from "./ResultActions";

type AssessmentResultsProps = {
  result: AssessmentResult;
  answers: Answers;
  focusId: number | null;
  /** Whether there were any Often / Sometimes statements to choose a focus from. */
  canChooseFocus: boolean;
  onChangeFocus: () => void;
  onRetake: () => void;
  onClear: () => void;
  headingRef: Ref<HTMLHeadingElement>;
};

const LEVELS: Record<PatternLevel, { label: string; dot: string; fill: string }> = {
  strong: { label: "Holding strong", dot: "bg-peacock-600", fill: "bg-peacock-600" },
  watch: { label: "Worth watching", dot: "bg-marigold-400", fill: "bg-marigold-400" },
  leak: { label: "Leaking power", dot: "bg-kumkum", fill: "bg-kumkum" },
};

export function AssessmentResults({
  result,
  answers,
  focusId,
  canChooseFocus,
  onChangeFocus,
  onRetake,
  onClear,
  headingRef,
}: AssessmentResultsProps) {
  const { band, focus, dominant } = result;

  return (
    // Keep the coloured bands, meters and the reframe strike when saved as a PDF.
    <div style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
      {/* ---------- Band + power score ---------- */}
      <Section tone="paper" className="pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16">
          <div>
            <p className="eyebrow text-marigold-700">Your {assessmentCopy.title.replace(/^My /, "")} result</p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="display-xl mt-4 scroll-mt-28 focus-visible:shadow-none focus-visible:outline-none"
            >
              {band.title}
            </h1>
            <p className="lede mt-6 max-w-2xl text-ink">{band.summary}</p>
            <ResultActions className="mt-8" />
          </div>
          <Card className="flex justify-center px-6 pt-8 pb-6 sm:px-10 break-inside-avoid">
            <PowerGauge score={result.powerScore} className="w-64 sm:w-72" />
          </Card>
        </div>
      </Section>

      {/* ---------- The power focus: the emotional peak ---------- */}
      <Section tone="jamun" aria-labelledby="focus-heading" className="break-inside-avoid">
        <div className="max-w-3xl">
          <h2 id="focus-heading" className="eyebrow text-marigold-300">
            Your power focus
          </h2>
          {focus ? (
            <>
              <p className="mt-5 text-jamun-200">The statement costing you the most today:</p>
              <blockquote className="lede mt-2 text-white">&ldquo;{focus.text}&rdquo;</blockquote>
              <p className="mt-10 text-jamun-200">The old script, and the shift that replaces it:</p>
              <Reframe
                script={focus.script}
                shift={focus.shift}
                size="xl"
                tone="dark"
                className="mt-4 print:[&_.reframe-strike]:[background-size:100%_0.12em]! print:[&_.reframe-write]:[clip-path:none]!"
              />
              <p className="mt-10 max-w-xl text-jamun-100">
                Write the shift where you&apos;ll see it tomorrow morning, and say it to yourself the next time the old
                script shows up.
              </p>
              {canChooseFocus ? (
                <button
                  type="button"
                  data-print="hide"
                  onClick={onChangeFocus}
                  className="mt-6 inline-flex min-h-11 items-center font-semibold text-marigold-300 underline decoration-2 underline-offset-[6px] hover:text-white"
                >
                  Choose a different focus
                </button>
              ) : null}
            </>
          ) : canChooseFocus ? (
            <>
              <p className="display-md mt-5 text-white">You skipped choosing your power focus.</p>
              <p className="lede mt-4 text-jamun-100">
                Pick the one statement costing you the most today, and see the shift that replaces it.
              </p>
              <Button variant="on-dark" className="mt-8" onClick={onChangeFocus} data-print="hide" arrow>
                Choose my power focus
              </Button>
            </>
          ) : (
            <>
              <p className="display-md mt-5 text-white">Nothing is draining you often right now.</p>
              <p className="lede mt-4 text-jamun-100">
                You marked every statement Rarely. Notice what helps you hold your power, and keep doing it, especially
                under pressure.
              </p>
            </>
          )}
        </div>
      </Section>

      {/* ---------- Pattern breakdown ---------- */}
      <Section tone="white">
        <SectionHeading
          eyebrow="Your four patterns"
          title="Where your power is going"
          intro="Each pattern scores 0 to 6 from its three statements. The higher the score, the more power it is draining."
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {result.patterns.map((p) => {
            const max = p.statementIds.length * 2;
            const level = LEVELS[p.level];
            return (
              <li key={p.pattern.id} className="rounded-card border border-line bg-paper p-6 break-inside-avoid sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                  <div>
                    <h3 className="display-sm">{p.pattern.name}</h3>
                    <p className="mt-1 text-muted">{p.pattern.power}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-sm font-semibold text-jamun-900">
                    <span aria-hidden="true" className={cn("size-2.5 rounded-full", level.dot)} />
                    {level.label}
                  </span>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div aria-hidden="true" className="grid flex-1 grid-cols-6 gap-1.5">
                    {Array.from({ length: max }, (_, i) => (
                      <span key={i} className={cn("h-2.5 rounded-full", i < p.score ? level.fill : "bg-jamun-100")} />
                    ))}
                  </div>
                  <p className="shrink-0 font-semibold text-jamun-900 tabular-nums">
                    <span className="sr-only">Score: </span>
                    {p.score}
                    <span className="font-normal text-muted"> / {max}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ---------- Where to start ---------- */}
      <Section tone="mist">
        {dominant.length > 0 ? (
          <>
            <SectionHeading
              eyebrow="Start here"
              title={dominant.length === 1 ? "Your strongest pattern" : "Your strongest patterns"}
              intro={
                dominant.length > 1
                  ? "These patterns scored the same. Start with the first one."
                  : undefined
              }
            />
            <div className={cn("mt-12 grid gap-5", dominant.length > 1 && "lg:grid-cols-2")}>
              {dominant.map((pattern) => (
                <article key={pattern.id} className="rounded-card border border-line bg-white p-6 break-inside-avoid sm:p-8">
                  <p className="eyebrow text-marigold-700">{pattern.power}</p>
                  <h3 className="display-md mt-3">{pattern.name}</h3>
                  <dl className="mt-6 grid gap-5">
                    <div>
                      <dt className="font-semibold text-jamun-900">What it looks like</dt>
                      <dd className="mt-1">{pattern.looksLike}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-jamun-900">What it costs you</dt>
                      <dd className="mt-1">{pattern.cost}</dd>
                    </div>
                  </dl>
                  <div className="mt-7 rounded-xl border border-peacock-600/20 bg-peacock-50 p-5">
                    <p className="font-semibold text-peacock-700">Try this in the next 24 hours</p>
                    <p className="mt-1.5">{pattern.practice}</p>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <SectionHeading
            eyebrow="Start here"
            title="No pattern stands out"
            intro="None of the four patterns scored above 1. Keep noticing the moments that test you, and the choices that keep your power in your hands."
          />
        )}
      </Section>

      {/* ---------- Next step ---------- */}
      <Section tone="paper">
        <SectionHeading eyebrow="Your next step" title="Recommended for you" />
        <RecommendedProgram result={result} />
      </Section>

      {/* ---------- Email + retake ---------- */}
      <Section tone="white" data-print="hide">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <h2 className="display-md">Email me my results</h2>
            <p className="mt-3 max-w-xl text-muted">
              Optional. Your results are already on this page; this sends a copy to your inbox and to Manisha&apos;s
              team, so a conversation can start from where you are.
            </p>
            <Card className="mt-8 p-6 sm:p-8">
              <EmailResultsForm answers={answers} focusId={focusId} bandId={band.id} />
            </Card>
          </div>
          <RetakePanel onRetake={onRetake} onClear={onClear} />
        </div>
      </Section>

      <div className="border-t border-line bg-paper">
        <Container className="py-10 text-sm text-muted">
          <p className="max-w-3xl">{assessmentCopy.disclaimer}</p>
          <p className="mt-2">{assessmentCopy.copyright}</p>
        </Container>
      </div>
    </div>
  );
}

function RecommendedProgram({ result }: { result: AssessmentResult }) {
  const program = getProgram(result.recommendedProgramSlug);
  if (!program) return null;
  const href = program.landingPath ?? `/programs/${program.slug}`;
  const primary = result.dominant[0];

  const reason =
    result.total >= HIGH_LEAK_TOTAL
      ? "Several patterns are draining your power at once. Working one to one lets you take them on together, at your pace."
      : primary
        ? `Recommended because your strongest pattern is ${primary.name}.`
        : "Your patterns are mostly in check, so the next step is leading from that strength.";

  return (
    <Card className="mt-12 grid gap-8 p-6 break-inside-avoid sm:p-8 md:grid-cols-[1.4fr_1fr] md:gap-12 md:p-10">
      <div>
        <p className="eyebrow text-marigold-700">{program.audience}</p>
        <h3 className="display-md mt-3">{program.title}</h3>
        <p className="lede mt-4 text-ink">{program.promise}</p>
        <p className="mt-4 text-muted">{reason}</p>
      </div>
      <div className="flex flex-col justify-between gap-8">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[0.9375rem]">
          {program.format.slice(0, 4).map((f) => (
            <div key={f.label}>
              <dt className="text-muted">{f.label}</dt>
              <dd className="font-semibold text-jamun-900">{f.value}</dd>
            </div>
          ))}
        </dl>
        <div data-print="hide" className="flex flex-col gap-3">
          <ButtonLink href={href} size="lg" arrow>
            See the program
          </ButtonLink>
          <ButtonLink href="/book" variant="dark" size="lg">
            Book a clarity call
          </ButtonLink>
          <p className="text-sm text-muted">
            Not sure where to start? On a free clarity call, Manisha will recommend the best starting point.
          </p>
        </div>
      </div>
    </Card>
  );
}

function RetakePanel({ onRetake, onClear }: { onRetake: () => void; onClear: () => void }) {
  const [confirming, setConfirming] = useState<"retake" | "clear" | null>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const retakeRef = useRef<HTMLButtonElement>(null);
  const opened = useRef(false);

  // Keep keyboard and screen-reader users in place: focus the question when it
  // opens, and return to the retake button when it is cancelled.
  useEffect(() => {
    if (confirming) {
      opened.current = true;
      confirmRef.current?.focus();
    } else if (opened.current) {
      retakeRef.current?.focus();
    }
  }, [confirming]);

  return (
    <div className="lg:pt-2">
      <h2 className="display-sm">Take it again</h2>
      <p className="mt-3 text-muted">
        Patterns shift as you work on them. Retake it in a few weeks to see what has changed, and save this page as a
        PDF first if you&apos;d like to compare.
      </p>
      {confirming ? (
        <div
          ref={confirmRef}
          role="group"
          aria-labelledby="retake-confirm"
          tabIndex={-1}
          className="mt-6 rounded-xl border border-line bg-paper p-5"
        >
          <p id="retake-confirm" className="font-semibold text-jamun-900">
            {confirming === "retake"
              ? "This clears your current answers and starts again. Continue?"
              : "This removes your answers and results from this browser. Continue?"}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="dark" size="sm" className="min-h-11" onClick={confirming === "retake" ? onRetake : onClear}>
              {confirming === "retake" ? "Yes, start again" : "Yes, clear my answers"}
            </Button>
            <Button variant="outline" size="sm" className="min-h-11" onClick={() => setConfirming(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-start gap-3">
          <Button
            ref={retakeRef}
            variant="outline"
            icon={<RotateCcw aria-hidden="true" />}
            onClick={() => setConfirming("retake")}
          >
            Retake the assessment
          </Button>
          <Button variant="link" className="min-h-11" onClick={() => setConfirming("clear")}>
            Clear my answers from this browser
          </Button>
        </div>
      )}
    </div>
  );
}
