import Image from "next/image";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { TickedNumber } from "@/components/corporate/TickedNumber";
import { Reveal } from "@/components/motion/Reveal";

export type CoachFact = { value: string; label: string };

/**
 * The coach's portrait when one is set in site.media.portrait; until then a
 * typographic panel of real numbers instead of a placeholder box. The name
 * is left to the section heading beside it.
 */
export function CoachPortrait({
  facts,
  note,
  className,
}: {
  facts: CoachFact[];
  /** One extra credential line, e.g. education. */
  note?: string;
  className?: string;
}) {
  const portrait: string = site.media.portrait;

  const panel = (
    <div
      data-tone="jamun"
      className="flex flex-col gap-8 rounded-card bg-jamun-900 p-7 sm:p-9"
    >
      <p className="eyebrow text-marigold-300">{site.role}</p>
      <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-7", !portrait && "lg:grid-cols-1")}>
        {facts.map((fact, i) => (
          <div key={fact.label}>
            <dt className="sr-only">{fact.label}</dt>
            <dd>
              <TickedNumber
                value={fact.value}
                delay={i * 0.15}
                className="block font-display text-[3rem] leading-none text-marigold-400 sm:text-[3.75rem]"
              />
              <span aria-hidden="true" className="mt-2 block leading-snug text-jamun-100">
                {fact.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>
      {note ? <p className="border-t border-white/12 pt-5 text-[0.9375rem] text-jamun-100">{note}</p> : null}
    </div>
  );

  if (!portrait) return <Reveal className={className}>{panel}</Reveal>;

  return (
    <figure className={cn("flex flex-col gap-4", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-mist">
        <Image
          src={portrait}
          alt={`${site.coach}, ${site.role}`}
          fill
          sizes="(min-width: 1024px) 26rem, 100vw"
          className="object-cover"
        />
      </div>
      <figcaption>{panel}</figcaption>
    </figure>
  );
}
