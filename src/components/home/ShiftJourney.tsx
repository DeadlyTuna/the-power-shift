import { journey } from "@/content/site";
import { Reveal } from "@/components/motion/Reveal";
import { Section, type SectionTone } from "@/components/ui/Layout";
import { JourneySteps } from "./JourneySteps";

/**
 * The five shifts, Reconnect → Succeed, as a staircase.
 *
 * Desktop: five treads rising left to right, joined by risers. Every step is
 * bottom-aligned and 3rem taller than the one before, so the stair shape
 * holds at any width. The heading sits in the open space above the first
 * three (lower) steps; the grid's second row is kept at least as tall as the
 * third step plus a gap, so the steps can never run into the heading.
 *
 * Phones and tablets: a numbered vertical path.
 *
 * The staircase draws itself step by step on first view (JourneySteps).
 */
export function ShiftJourney({ tone = "paper", className }: { tone?: SectionTone; className?: string }) {
  return (
    <Section tone={tone} aria-labelledby="journey-title" className={className}>
      <div className="lg:grid lg:grid-cols-5 lg:grid-rows-[auto_minmax(20.5rem,auto)]">
        <Reveal className="relative z-10 lg:col-span-3 lg:col-start-1 lg:row-start-1 lg:pr-10">
          <p className="eyebrow text-marigold-700">The Power Shift journey</p>
          <h2 id="journey-title" className="display-lg mt-4">
            Five shifts, one direction
          </h2>
          <p className="lede mt-5 max-w-xl text-muted">
            Every program is designed around the same five shifts. Each one makes the next possible, from reconnecting
            with yourself to succeeding by aligning vision with action.
          </p>
        </Reveal>

        <JourneySteps steps={journey} />
      </div>
    </Section>
  );
}
