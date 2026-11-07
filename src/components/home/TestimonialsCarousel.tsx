"use client";

import { useCallback, useId, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@/content/testimonials";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/kit/carousel";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { cn } from "@/lib/cn";

/**
 * Client testimonials in a swipeable row (shadcn/ui carousel, Embla).
 *
 * Phones show one card with the next peeking in; tablets two; desktop shows
 * them all, and the controls step aside when there's nothing to scroll.
 * Nothing moves on its own. Previous/Next buttons, position dots, swipe,
 * and the arrow keys (inside the carousel) all work; each card keeps its
 * "Read the full review" toggle, and Embla brings a focused card into view.
 */

type Snapshot = { selected: number; count: number; canPrev: boolean; canNext: boolean };

const EMPTY = "0|0|0|0";

function read(api: CarouselApi | undefined): string {
  if (!api) return EMPTY;
  return [
    api.selectedScrollSnap(),
    api.scrollSnapList().length,
    Number(api.canScrollPrev()),
    Number(api.canScrollNext()),
  ].join("|");
}

function parse(key: string): Snapshot {
  const [selected, count, canPrev, canNext] = key.split("|").map(Number);
  return { selected, count, canPrev: canPrev === 1, canNext: canNext === 1 };
}

const controlClass =
  "inline-flex size-11 items-center justify-center rounded-full border border-line bg-white text-jamun-900 transition-colors duration-200 hover:border-jamun-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line";

export function TestimonialsCarousel({ items, className }: { items: Testimonial[]; className?: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const dotId = useId();

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!api) return () => {};
      api.on("select", onChange).on("reInit", onChange);
      return () => {
        api.off("select", onChange).off("reInit", onChange);
      };
    },
    [api],
  );
  const { selected, count, canPrev, canNext } = parse(
    useSyncExternalStore(
      subscribe,
      () => read(api),
      () => EMPTY,
    ),
  );

  // Before Embla measures (and on the server) count is 0: keep the buttons in place so nothing jumps.
  const scrollable = count === 0 || count > 1;

  return (
    <Carousel
      opts={{ align: "start" }}
      setApi={setApi}
      aria-label="Client testimonials"
      className={cn("[--slide-gap:1.25rem] lg:[--slide-gap:1.5rem]", className)}
    >
      <CarouselContent className="-ml-(--slide-gap) cursor-grab active:cursor-grabbing">
        {items.map((testimonial, i) => (
          <CarouselItem
            key={testimonial.id}
            aria-label={`${i + 1} of ${items.length}`}
            className="basis-[86%] pl-(--slide-gap) sm:basis-[70%] md:basis-1/2 lg:basis-1/3"
          >
            <TestimonialCard testimonial={testimonial} />
          </CarouselItem>
        ))}
      </CarouselContent>

      {scrollable ? (
        <div
          data-print="hide"
          // Three or fewer fit side by side on desktop, so the controls are only for smaller screens.
          className={cn("mt-8 flex items-center justify-center gap-3", items.length <= 3 && "lg:hidden")}
        >
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            disabled={count > 0 && !canPrev}
            className={controlClass}
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
            <span className="sr-only">Previous testimonial</span>
          </button>

          {count > 1 ? (
            <div className="flex items-center gap-1">
              {Array.from({ length: count }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => api?.scrollTo(i)}
                  aria-current={i === selected ? "true" : undefined}
                  className="group/dot inline-flex size-11 items-center justify-center"
                >
                  <span className="sr-only">Show testimonial {i + 1}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative block h-2 rounded-full bg-line transition-[width,background-color] duration-300 ease-shift group-hover/dot:bg-jamun-200",
                      i === selected ? "w-7" : "w-2",
                    )}
                  >
                    {i === selected ? (
                      <motion.span
                        layoutId={`${dotId}-dot`}
                        className="absolute inset-0 rounded-full bg-marigold-400"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => api?.scrollNext()}
            disabled={count > 0 && !canNext}
            className={controlClass}
          >
            <ChevronRight aria-hidden="true" className="size-5" />
            <span className="sr-only">Next testimonial</span>
          </button>
        </div>
      ) : null}
    </Carousel>
  );
}
