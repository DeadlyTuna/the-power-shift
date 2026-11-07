import type { Testimonial } from "@/content/testimonials";
import { cn } from "@/lib/cn";

/**
 * A testimonial: the pull-quote large, the full words one tap away. The
 * full review fades in when opened (CSS only; stilled by reduced motion).
 */
export function TestimonialCard({
  testimonial,
  tone = "light",
  className,
}: {
  testimonial: Testimonial;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <figure
      className={cn(
        "flex h-full flex-col rounded-card border p-7 transition-[border-color,box-shadow] duration-300 ease-shift sm:p-8",
        dark
          ? "border-white/12 bg-jamun-800 text-jamun-100 hover:border-white/25"
          : "border-line bg-white text-ink hover:border-jamun-200 hover:shadow-[0_20px_44px_-30px_rgba(42,22,54,0.35)]",
        className,
      )}
    >
      {/* Decorative, so marigold-400 is used on both tones. */}
      <span aria-hidden="true" className="font-display text-6xl leading-[0.6] text-marigold-400">
        &ldquo;
      </span>
      <blockquote className="mt-4 flex-1">
        <p className={cn("display-sm", dark ? "text-white" : "text-jamun-900")}>{testimonial.excerpt}</p>
        {testimonial.quote !== testimonial.excerpt ? (
          <details className="group mt-3">
            {/* min-h-11 keeps the toggle a 44px tap target; the underline sits on the label itself. */}
            <summary
              className={cn(
                "inline-flex min-h-11 cursor-pointer list-none items-center text-[0.9375rem] font-semibold [&::-webkit-details-marker]:hidden",
                !dark && "text-jamun-900",
              )}
            >
              <span className="underline decoration-marigold-400 decoration-2 underline-offset-4 group-open:hidden">
                Read the full review
              </span>
              <span className="hidden underline decoration-marigold-400 decoration-2 underline-offset-4 group-open:inline">
                Show less
              </span>
            </summary>
            <p
              className={cn(
                "mt-3 animate-in text-[0.9875rem] leading-relaxed duration-500 fade-in-0 slide-in-from-top-1",
                dark ? "text-jamun-100" : "text-muted",
              )}
            >
              {testimonial.quote}
            </p>
          </details>
        ) : null}
      </blockquote>
      <figcaption className={cn("mt-7 border-t pt-5", dark ? "border-white/12" : "border-line")}>
        <p className={cn("font-semibold", dark ? "text-white" : "text-jamun-900")}>{testimonial.name}</p>
        <p className={cn("text-[0.9375rem]", dark ? "text-jamun-200" : "text-muted")}>{testimonial.role}</p>
        {testimonial.context ? (
          <p className={cn("eyebrow mt-3 text-[0.6875rem]", dark ? "text-marigold-300" : "text-marigold-700")}>
            {testimonial.context}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}
