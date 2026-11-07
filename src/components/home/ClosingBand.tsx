import type { ReactNode } from "react";
import { Ripple } from "@/components/kit/ripple";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Layout";

/**
 * The last word on the home and About pages: a statement on the left, the
 * next steps stacked on the right. Pass the buttons as `actions`, with the
 * single marigold primary first.
 *
 * Behind the actions, slow marigold rings breathe outwards (Magic UI
 * Ripple), like a voice carrying. Decorative; still with reduced motion.
 */
export function ClosingBand({
  id,
  eyebrow,
  title,
  body,
  actions,
  note,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  actions: ReactNode;
  note?: ReactNode;
}) {
  const titleId = `${id}-title`;
  return (
    <Section tone="jamun" id={id} aria-labelledby={titleId} className="relative isolate overflow-hidden">
      <Ripple
        aria-hidden="true"
        mainCircleSize={260}
        mainCircleOpacity={0.2}
        numCircles={6}
        // Ripple draws in the kit's foreground colour: point it at marigold, and slow the breathing right down.
        className="-z-10 [--color-foreground:var(--color-marigold-300)] [--duration:7s] mask-[radial-gradient(closest-side,#000_35%,transparent)] max-lg:top-auto max-lg:h-[36rem] lg:left-[45%]"
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-20">
        <Reveal>
          <p className="eyebrow text-marigold-300">{eyebrow}</p>
          <h2 id={titleId} className="display-lg mt-4">
            {title}
          </h2>
          <div className="lede mt-5 max-w-2xl text-jamun-100">{body}</div>
        </Reveal>
        <Reveal delay={0.15} className="flex flex-col gap-3 sm:max-w-md lg:max-w-none">
          {actions}
          {note ? <div className="mt-2 text-[0.9375rem] text-jamun-200">{note}</div> : null}
        </Reveal>
      </div>
    </Section>
  );
}
