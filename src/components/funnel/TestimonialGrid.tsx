import type { Testimonial } from "@/content/testimonials";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { cn } from "@/lib/cn";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";

/** Real client words from src/content/testimonials.ts; each card names where it came from. */
export function TestimonialGrid({ items, className }: { items: Testimonial[]; className?: string }) {
  if (!items.length) return null;
  return (
    <StaggerList stagger={0.1} className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((t) => (
        <StaggerListItem key={t.id}>
          <TestimonialCard testimonial={t} />
        </StaggerListItem>
      ))}
    </StaggerList>
  );
}
