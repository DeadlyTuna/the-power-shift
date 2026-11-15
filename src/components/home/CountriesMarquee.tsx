import { Marquee } from "@/components/kit/marquee";
import { cn } from "@/lib/cn";

/** "Germany, China, Korea, Sweden & North America" */
export function joinWithAmpersand(items: readonly string[]) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} & ${items[items.length - 1]}`;
}

/**
 * The countries Manisha has led in, drifting slowly past (Magic UI marquee).
 *
 * Marquee repeats its children, so screen readers get the list once as
 * text and the moving copy is aria-hidden. It pauses on hover. With reduced
 * motion the marquee is swapped for the same list as static, wrapping text.
 */
export function CountriesMarquee({
  countries,
  className,
  itemClassName,
}: {
  countries: readonly string[];
  className?: string;
  itemClassName?: string;
}) {
  const joined = joinWithAmpersand(countries);

  return (
    <div className={className}>
      <span className="sr-only">{joined}</span>

      <div aria-hidden="true" className="hidden motion-reduce:block">
        {joined}
      </div>

      <Marquee
        aria-hidden="true"
        pauseOnHover
        repeat={3}
        className="-mx-2 py-0.5 [--duration:38s] [--gap:0rem] motion-reduce:hidden mask-[linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
      >
        {countries.map((country) => (
          <span key={country} className={cn("flex shrink-0 items-center whitespace-nowrap", itemClassName)}>
            {country}
            <span className="mx-4 inline-block size-1.5 rounded-full bg-marigold-400" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
