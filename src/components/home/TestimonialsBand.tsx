import { testimonials } from "@/content/testimonials";
import { Reveal } from "@/components/motion/Reveal";
import { Section, SectionHeading, type SectionTone } from "@/components/ui/Layout";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

/** All client testimonials, verbatim from src/content/testimonials.ts. */
export function TestimonialsBand({
  tone = "paper",
  eyebrow = "In their words",
  title = "Why clients choose Manisha",
  className,
}: {
  tone?: SectionTone;
  eyebrow?: string;
  title?: string;
  className?: string;
}) {
  return (
    <Section tone={tone} aria-labelledby="testimonials-title" className={className}>
      <Reveal>
        <SectionHeading eyebrow={eyebrow} title={<span id="testimonials-title">{title}</span>} />
      </Reveal>
      <Reveal delay={0.1} amount={0.15} className="mt-12">
        <TestimonialsCarousel items={testimonials} />
      </Reveal>
    </Section>
  );
}
