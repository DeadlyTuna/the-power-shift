import type { ReactNode } from "react";
import { credentials } from "@/content/site";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { cn } from "@/lib/cn";
import { CountriesMarquee } from "./CountriesMarquee";
import { TickedFigure } from "./TickedFigure";

/**
 * Verified facts only (from `credentials` in src/content/site.ts). No logos,
 * no derived numbers. The two year counts tick up once; the countries drift
 * past as a slow marquee (read once, as plain text, by screen readers).
 *
 * Phones: the two "years" facts share the first row, the longer facts get a
 * row each. Desktop: four columns in reading order.
 */
const facts: { label: string; value: ReactNode; mobile: string }[] = [
  {
    label: "Corporate leadership",
    value: <TickedFigure value={credentials.corporateYears} suffix=" years" delay={0.5} />,
    mobile: "order-1 pr-4",
  },
  {
    label: "Leadership across",
    value: <CountriesMarquee countries={credentials.countries} />,
    mobile: "order-3 col-span-2 border-t",
  },
  {
    label: "Education",
    value: credentials.education,
    mobile: "order-4 col-span-2 border-t",
  },
  {
    label: "Coaching",
    value: <TickedFigure value={credentials.coachingYears} suffix=" years" delay={0.7} />,
    mobile: "order-2 border-l pl-5",
  },
];

export function CredentialsStrip({ className }: { className?: string }) {
  return (
    <Stagger amount={0.3} className={className}>
      <dl
        className={cn(
          "grid grid-cols-2 border-t border-line",
          "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)_minmax(0,1.4fr)_minmax(0,0.8fr)]",
        )}
      >
        {facts.map((fact) => (
          <StaggerItem
            key={fact.label}
            className={cn(
              "min-w-0 border-line py-5",
              fact.mobile,
              "lg:order-none lg:col-span-1 lg:border-t-0 lg:border-l lg:px-6 lg:py-7 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0",
            )}
          >
            <dt className="eyebrow text-[0.75rem] text-marigold-700">{fact.label}</dt>
            <dd className="mt-2 font-display text-[1.3125rem] leading-snug text-jamun-900 sm:text-2xl">{fact.value}</dd>
          </StaggerItem>
        ))}
      </dl>
    </Stagger>
  );
}
