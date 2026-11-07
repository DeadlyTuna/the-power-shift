import type { Metadata } from "next";
import { products } from "@/content/merch";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { MerchCatalog } from "@/components/merch/MerchCatalog";
import { ShippingNotes } from "@/components/merch/ShippingNotes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Merch",
  description:
    "Journals, reframe cards, mugs, totes and tees from The Power Shift: everyday reminders of the shifts you're making. Shipped across India.",
  path: "/merch",
});

export default function MerchPage() {
  return (
    <>
      <Section tone="paper" className="pt-12 pb-14 md:pt-20 md:pb-20" aria-labelledby="merch-title">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow text-marigold-700">The Power Shift merch</p>
            <h1 id="merch-title" className="display-lg mt-4 max-w-2xl">
              Everyday reminders of the shifts you&rsquo;re making
            </h1>
            <p className="lede mt-5 max-w-xl text-muted">
              Journals, reframe cards and a few things for your desk and your day. Each one carries a reframe from the
              coaching, so the new script stays in sight on ordinary days.
            </p>
          </div>
          <Reframe
            size="lg"
            script="Change needs a big moment."
            shift="Change is a small reminder, every day."
            className="border-l-2 border-marigold-400 pl-5 sm:pl-7"
          />
        </div>
      </Section>

      <Section tone="white" className="pt-12 md:pt-16" aria-labelledby="shop-heading">
        <h2 id="shop-heading" className="display-md">
          Shop the range
        </h2>
        <div className="mt-6">
          <MerchCatalog products={products} />
        </div>
      </Section>

      <Section tone="mist" className="py-14 md:py-16" aria-labelledby="shipping-heading">
        <h2 id="shipping-heading" className="sr-only">
          Shipping and returns
        </h2>
        <ShippingNotes />
      </Section>

      <Section tone="paper" aria-labelledby="gifting-heading">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-marigold-700">For teams</p>
            <h2 id="gifting-heading" className="display-md mt-3">
              Gifting for your team?
            </h2>
            <p className="lede mt-4 text-muted">
              Planning a leadership workshop or an offsite? Ask about journals and reframe cards for your people when you
              enquire about corporate training.
            </p>
          </div>
          <ButtonLink href="/corporate" variant="outline" size="lg" arrow className="self-start md:self-auto">
            Explore corporate training
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
