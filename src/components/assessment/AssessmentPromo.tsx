import { assessmentCopy, patterns, statements } from "@/content/assessment";
import { MagicCard } from "@/components/kit/magic-card";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";

/**
 * Band inviting visitors to take the free Power Self-Assessment. Used on the
 * home page, the programs pages and the thank-you page.
 *
 * The four pattern tiles stagger in, and a soft marigold spotlight follows
 * the pointer across them (Magic UI MagicCard, recoloured per tone).
 */
export type AssessmentPromoProps = {
  tone?: "jamun" | "mist";
  className?: string;
};

export function AssessmentPromo({ tone = "jamun", className }: AssessmentPromoProps) {
  const dark = tone === "jamun";

  return (
    <Section tone={tone} className={className}>
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <Reveal>
          <p className={cn("eyebrow", dark ? "text-marigold-300" : "text-marigold-700")}>Free Power Self-Assessment</p>
          <h2 className={cn("display-lg mt-4", dark ? "text-white" : "text-jamun-900")}>
            Where is your power leaking?
          </h2>
          <p className={cn("lede mt-5 max-w-xl", dark ? "text-jamun-100" : "text-muted")}>
            Rate {statements.length} short statements and see which pattern is costing you the most today, with one
            small practice to try in the next 24 hours.
          </p>
          <p className={cn("mt-8 font-semibold", dark ? "text-white" : "text-jamun-900")}>
            {statements.length} statements <span aria-hidden="true">·</span>
            <span className="sr-only">,</span> about {assessmentCopy.minutes} minutes <span aria-hidden="true">·</span>
            <span className="sr-only">,</span> free
          </p>
          <ButtonLink
            href="/assessment"
            size="lg"
            arrow
            className="mt-5 w-full px-6 text-base text-balance sm:w-auto sm:px-8 sm:text-[1.0625rem]"
          >
            Take the free Power Self-Assessment
          </ButtonLink>
        </Reveal>

        <div>
          <p className={cn("text-[0.9375rem] font-semibold", dark ? "text-jamun-200" : "text-muted")}>
            The four patterns it looks at
          </p>
          <StaggerList stagger={0.1} amount={0.3} className="mt-4 grid gap-3 sm:grid-cols-2">
            {patterns.map((p) => (
              <StaggerListItem key={p.id} className="rounded-card">
                <MagicCard
                  gradientSize={220}
                  gradientFrom="#f2a93b"
                  gradientTo={dark ? "#4e2f61" : "#fbe3b8"}
                  gradientColor={dark ? "#4e2f61" : "#fbe3b8"}
                  gradientOpacity={dark ? 0.7 : 0.55}
                  className={cn(
                    "h-full rounded-card p-5",
                    // MagicCard paints with the kit's background and border tokens; point them at this tone.
                    dark
                      ? "[--color-background:var(--color-jamun-800)] [--color-border:rgba(255,255,255,0.12)]"
                      : "[--color-background:#ffffff] [--color-border:var(--color-line)]",
                  )}
                >
                  <h3 className={cn("display-sm", dark ? "text-white" : "text-jamun-900")}>{p.name}</h3>
                  <p className={cn("mt-1.5 text-[0.9375rem]", dark ? "text-jamun-200" : "text-muted")}>{p.power}</p>
                </MagicCard>
              </StaggerListItem>
            ))}
          </StaggerList>
        </div>
      </div>
    </Section>
  );
}
