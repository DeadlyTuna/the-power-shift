import type { ReactNode } from "react";
import { Container } from "@/components/ui/Layout";

/**
 * Two-column hero for ad landing pages: the pitch on the left, the
 * registration card on the right. On phones the card follows the pitch.
 */
export function FunnelHero({
  labelledBy,
  children,
  aside,
}: {
  /** Id of the page's h1. */
  labelledBy: string;
  children: ReactNode;
  aside: ReactNode;
}) {
  return (
    <section data-tone="paper" aria-labelledby={labelledBy} className="bg-paper pt-8 pb-16 sm:pt-12 md:pb-24 lg:pt-16">
      <Container className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-14 xl:gap-20">
        <div className="min-w-0">{children}</div>
        <div className="min-w-0">{aside}</div>
      </Container>
    </section>
  );
}
