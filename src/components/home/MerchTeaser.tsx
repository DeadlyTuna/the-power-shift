import { getProduct, type Product } from "@/content/merch";
import { ProductCard } from "@/components/merch/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";

/**
 * Three products from the catalog. Note: src/content/merch.ts is still a
 * sample catalog (merchIsSample); this teaser follows whatever it contains.
 *
 * The cards stagger in and lift gently under a mouse pointer.
 */
const FEATURED = ["power-shift-journal", "reframe-card-deck", "lead-inspire-succeed-mug"];

export function MerchTeaser() {
  const items = FEATURED.map((slug) => getProduct(slug)).filter((p): p is Product => Boolean(p));
  if (items.length === 0) return null;

  return (
    <Section tone="white" aria-labelledby="merch-teaser-title">
      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Merch"
          title={<span id="merch-teaser-title">Reminders you can hold</span>}
          intro="Journals, reframe cards and a few things for your desk, each carrying a shift from the coaching."
        />
        <ButtonLink href="/merch" variant="link" arrow className="min-h-11 shrink-0 self-start md:self-auto">
          Shop all merch
        </ButtonLink>
      </Reveal>

      {/* Two across on phones and tablets (the third joins on desktop), three across on desktop. */}
      <StaggerList stagger={0.1} className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {items.map((product, i) => (
          <StaggerListItem
            key={product.slug}
            whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 22 } }}
            className={cn(
              "rounded-card transition-shadow duration-300 ease-shift hover:shadow-[0_24px_48px_-30px_rgba(42,22,54,0.45)]",
              i === 2 && "hidden lg:block",
            )}
          >
            <ProductCard product={product} headingLevel="h3" />
          </StaggerListItem>
        ))}
      </StaggerList>
    </Section>
  );
}
