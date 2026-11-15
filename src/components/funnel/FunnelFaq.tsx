import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/kit/accordion";
import { FaqList } from "@/components/shared/FaqList";
import { cn } from "@/lib/cn";

/**
 * FAQ for the funnel pages as an animated accordion (Radix, via the kit):
 * real buttons with aria-expanded, arrow-key movement between questions, and
 * answers that slide open. One answer open at a time; any can be closed.
 *
 * Radix needs JavaScript to open anything, so visitors without it get the
 * site's native <details> list instead (the accordion is hidden for them).
 * The answers are also in the page's FAQ structured data for search.
 */
export function FunnelFaq({ faqs, className }: { faqs: { q: string; a: string }[]; className?: string }) {
  if (!faqs.length) return null;
  return (
    <div className={className}>
      <Accordion type="single" collapsible className="border-y border-line [html:not(.js)_&]:hidden">
        {faqs.map((faq, i) => (
          <AccordionItem key={faq.q} value={`faq-${i}`} className="border-line">
            <AccordionTrigger
              className={cn(
                "group min-h-14 items-center gap-6 rounded-none py-4 text-lg leading-snug font-semibold text-jamun-900 hover:no-underline",
                "[&>svg]:size-9 [&>svg]:translate-y-0 [&>svg]:rounded-full [&>svg]:border [&>svg]:border-line [&>svg]:bg-white [&>svg]:p-2 [&>svg]:text-jamun-900 [&>svg]:transition-[transform,background-color] [&>svg]:duration-300",
                "data-[state=open]:[&>svg]:bg-marigold-200 hover:[&>svg]:border-jamun-200",
              )}
            >
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="max-w-2xl pr-12 pb-6 text-[1.0625rem] leading-relaxed text-muted">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <noscript>
        <FaqList faqs={faqs} />
      </noscript>
    </div>
  );
}
