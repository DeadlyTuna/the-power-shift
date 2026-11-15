import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The site's one FAQ accordion: native <details> disclosures, so keyboard and
 * screen-reader support come from the browser, it works without JavaScript,
 * and the answers stay in the HTML for search.
 *
 * size "md" for full FAQ sections, "sm" for short lists beside a form.
 */
export function FaqList({
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
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {faqs.map((faq) => (
        <details key={faq.q} className="group">
          <summary
            className={cn(
              "flex min-h-14 cursor-pointer list-none items-center justify-between text-left leading-snug font-semibold text-jamun-900 [&::-webkit-details-marker]:hidden",
              small ? "gap-4 py-3.5" : "gap-6 py-4 text-lg",
            )}
          >
            <span>{faq.q}</span>
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-white text-jamun-900 transition-[transform,background-color] duration-200 ease-shift group-open:rotate-45 group-open:bg-marigold-200",
                small ? "size-8" : "size-9",
              )}
            >
              <Plus className="size-4" />
            </span>
          </summary>
          <p className={cn("max-w-2xl text-muted", small ? "pr-10 pb-5 text-[0.9875rem] leading-relaxed" : "pr-12 pb-6")}>
            {faq.a}
          </p>
        </details>
      ))}
    </div>
  );
}
