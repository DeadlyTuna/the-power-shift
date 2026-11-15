import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Program } from "@/content/programs";
import { Card } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";
import { EventAwareText, EventStatus } from "./EventState";
import { cardCtaLabel, eventWhen, formatValue, priceIsFigure, priceLabel, programHref } from "./program-helpers";

/**
 * One program in a grid. Server-rendered; the only time-dependent part (open
 * vs waitlist) lives in small client children that render after mount.
 * The whole card is tappable through the CTA's stretched hit area, while
 * screen readers get a single, descriptive link.
 */

export type ProgramCardProps = {
  program: Program;
  className?: string;
  /** Heading level for the program title; match the surrounding outline. */
  headingLevel?: "h2" | "h3";
};

type Fact = { label: ReactNode; value: string };

function keyFacts(program: Program): Fact[] {
  const { event } = program;
  if (event) {
    return [
      {
        label: <EventAwareText startsAt={event.startsAt} pending="Date" open="Next session" closed="Last session" />,
        value: eventWhen(program) ?? "",
      },
      { label: "Platform", value: event.platform },
      { label: "Language", value: event.language },
    ];
  }

  const wanted =
    program.mode === "application" ? ["Starts with", "Format", "Language"] : ["Format", "Length", "Group size"];
  return wanted.flatMap((label) => {
    const value = formatValue(program, label);
    return value ? [{ label, value }] : [];
  });
}

export function ProgramCard({ program, className, headingLevel: Heading = "h3" }: ProgramCardProps) {
  const href = programHref(program);
  const price = priceLabel(program);
  const facts = keyFacts(program);

  return (
    <Card
      className={cn(
        "group/card relative flex h-full flex-col p-6 transition-colors duration-200 hover:border-jamun-200 sm:p-7",
        className,
      )}
    >
      <div className="flex-1">
        <div className="flex min-h-7 flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <p className="eyebrow pt-1 text-marigold-700">{program.audience}</p>
          {program.event ? <EventStatus startsAt={program.event.startsAt} /> : null}
        </div>

        <Heading className="display-sm mt-4">{program.title}</Heading>
        <p className="mt-3 text-muted">{program.promise}</p>

        {facts.length > 0 ? (
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[0.9375rem]">
            {facts.map((fact, i) => (
              <div key={i} className="contents">
                <dt className="text-muted">{fact.label}</dt>
                <dd className="font-medium text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-t border-line pt-5">
        {price ? (
          <p className={priceIsFigure(program) ? "font-display text-[1.75rem] leading-none text-jamun-900" : "font-semibold text-jamun-900"}>
            <span className="sr-only">Price: </span>
            {price}
          </p>
        ) : (
          <span />
        )}
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-[6px] after:absolute after:inset-0 after:rounded-card after:content-[''] hover:decoration-jamun-900"
        >
          {cardCtaLabel(program.mode)}
          <span className="sr-only">: {program.title}</span>
          <ArrowRight
            aria-hidden="true"
            className="size-[1.1em] shrink-0 transition-transform duration-200 ease-shift group-hover/card:translate-x-1"
          />
        </Link>
      </div>
    </Card>
  );
}
