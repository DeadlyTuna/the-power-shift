import { Plus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/kit/accordion";
import { cn } from "@/lib/cn";

/**
 * Animated FAQ for program and course pages, built on the kit (Radix)
 * Accordion: each question is a button in an <h3> with aria-expanded and
 * aria-controls, arrow keys move between questions, and answers open with a
 * height animation (instant with reduced motion). Search engines read the
 * answers from the page's FAQPage JSON-LD.
 *
 * size "md" for full FAQ sections, "sm" for short lists beside a form.
 */
export function FaqAccordion({
  faqs,
  size = "md",
  className,
}: {
  faqs: { q: string; a: string }[];
  size?: "sm" | "md";
  className?: string;
}) {
  const small = size === "sm";
  return (
    <Accordion type="single" collapsible className={cn("border-y border-line", className)}>
      {faqs.map((faq, i) => (
        <AccordionItem key={faq.q} value={`faq-${i}`} className="border-line">
          <AccordionTrigger
            className={cn(
              "group/faq min-h-14 items-center leading-snug font-semibold text-jamun-900 hover:no-underline focus-visible:ring-marigold-400 [&>svg]:hidden",
              small ? "gap-4 py-3.5 text-base" : "gap-6 py-4 text-lg",
            )}
          >
            <span>{faq.q}</span>
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-white text-jamun-900 transition-[rotate,background-color] duration-300 ease-shift group-hover/faq:border-jamun-200 group-data-[state=open]/faq:rotate-45 group-data-[state=open]/faq:bg-marigold-200",
                small ? "size-8" : "size-9",
              )}
            >
              <Plus className="size-4" />
            </span>
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              "max-w-2xl text-muted",
              small ? "pr-10 pb-5 text-[0.9875rem] leading-relaxed" : "pr-12 pb-6 text-[1.0625rem] leading-relaxed",
            )}
          >
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
