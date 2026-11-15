import Image from "next/image";
import { credentials, site } from "@/content/site";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";
import { cn } from "@/lib/cn";

/**
 * Manisha's portrait when site.media.portrait is set. Until then, a
 * typographic treatment instead of a placeholder: her name set large over
 * the places she has led in, like a page from a passport. The places are
 * stamped in one after another on first view.
 */
export function CoachMark({
  className,
  eager = false,
  sizes = "(min-width: 1024px) 28rem, 100vw",
}: {
  className?: string;
  /** Load the portrait immediately (when it sits above the fold). */
  eager?: boolean;
  sizes?: string;
}) {
  // Widen from the literal "" type in site.ts so the portrait branch type-checks.
  const portrait: string = site.media.portrait;

  if (portrait) {
    return (
      <figure className={cn("flex flex-col", className)}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-mist">
          <Image
            src={portrait}
            alt={`Portrait of ${site.coach}`}
            fill
            sizes={sizes}
            loading={eager ? "eager" : "lazy"}
            className="object-cover"
          />
        </div>
        <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="font-display text-2xl text-jamun-900">{site.coach}</span>
          <span className="text-[0.9375rem] text-muted">{site.role}</span>
        </figcaption>
      </figure>
    );
  }

  const [firstName, ...rest] = site.coach.split(" ");

  return (
    <div className={cn("rounded-card bg-mist p-7 sm:p-10", className)}>
      <p className="font-display text-[3.5rem] leading-[0.92] text-jamun-900 sm:text-[4.25rem] xl:text-[4.75rem]">
        <span className="block">{firstName}</span>
        {rest.length ? <span className="block">{rest.join(" ")}</span> : null}
      </p>
      <p className="eyebrow mt-5 text-marigold-700">{site.role}</p>

      <p className="mt-10 text-[0.9375rem] text-muted">{credentials.corporateYears} years of leadership across</p>
      <StaggerList stagger={0.09} amount={0.3} className="mt-3 border-t border-jamun-200">
        {credentials.countries.map((country) => (
          <StaggerListItem
            key={country}
            className="border-b border-jamun-200 py-2.5 text-lg leading-snug font-semibold text-jamun-900"
          >
            {country}
          </StaggerListItem>
        ))}
      </StaggerList>
    </div>
  );
}
