import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { shipping } from "@/content/merch";
import { site, whatsappLink } from "@/content/site";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Section } from "@/components/ui/Layout";
import { WhatsAppIcon } from "@/components/ui/icons";
import { ClearCartOnMount } from "@/components/merch/ClearCartOnMount";
import { isOrderReference } from "@/lib/merch/order";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Order confirmed",
  description: "Your merch order is confirmed.",
  path: "/order/success",
  noindex: true,
});

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function OrderSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { ref } = await searchParams;
  const reference = isOrderReference(ref) ? ref : null;

  const steps = [
    {
      title: "Payment received",
      body: reference
        ? `Your order reference is ${reference}. Keep it handy if you need to get in touch.`
        : "Keep your payment reference handy if you need to get in touch.",
    },
    { title: "Packed and dispatched", body: `${shipping.dispatch}.` },
    { title: "Delivered to your door", body: `${shipping.delivery}.` },
  ];

  const whatsappMessage = reference
    ? `Hi, I have a question about my merch order ${reference}.`
    : "Hi, I have a question about my merch order.";

  return (
    <>
      {reference ? <ClearCartOnMount /> : null}

      <Section tone="paper" className="pt-12 md:pt-20" aria-labelledby="success-title">
        <div className="max-w-3xl">
          <p className="eyebrow text-peacock-700">Order confirmed</p>
          <h1 id="success-title" className="display-lg mt-4">
            Thank you. Your order is confirmed.
          </h1>
          {reference ? (
            <p className="lede mt-5 text-muted">
              Order reference{" "}
              <strong className="font-semibold whitespace-nowrap text-jamun-900 tabular-nums">{reference}</strong>
            </p>
          ) : (
            <p className="lede mt-5 text-muted">
              If you&rsquo;ve just paid, your order is saved with us. Message us any time if you need your reference.
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <section aria-labelledby="next-heading">
            <h2 id="next-heading" className="display-sm">
              What happens next
            </h2>
            <ol className="mt-6 flex flex-col">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-5 border-t border-line py-5 last:border-b">
                  <span aria-hidden="true" className="font-display text-2xl leading-none text-marigold-700 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold text-jamun-900">{step.title}</h3>
                    <p className="mt-1 text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <aside aria-labelledby="help-heading">
            <Card className="p-6 sm:p-7">
              <h2 id="help-heading" className="display-sm">
                Questions about your order?
              </h2>
              <p className="mt-2 text-muted">
                {site.contact.hours}. Mention your order reference and we&rsquo;ll find it quickly.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <ButtonLink href={whatsappLink(whatsappMessage)} variant="dark" icon={<WhatsAppIcon />}>
                  Message us on WhatsApp
                </ButtonLink>
              </div>
              <ul className="mt-6 flex flex-col gap-1 text-[0.9375rem]">
                <li>
                  <a
                    href={`tel:${site.contact.phoneE164}`}
                    className="inline-flex min-h-11 items-center gap-2.5 text-jamun-900 hover:underline"
                  >
                    <Phone aria-hidden="true" className="size-4 text-marigold-700" />
                    {site.contact.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="inline-flex min-h-11 items-center gap-2.5 break-all text-jamun-900 hover:underline"
                  >
                    <Mail aria-hidden="true" className="size-4 shrink-0 text-marigold-700" />
                    {site.contact.email}
                  </a>
                </li>
              </ul>
            </Card>
          </aside>
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <ButtonLink href="/merch" variant="outline" arrow>
            Back to the merch
          </ButtonLink>
          <ButtonLink href="/assessment" variant="link" className="min-h-12">
            Take the free Power Self-Assessment
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
