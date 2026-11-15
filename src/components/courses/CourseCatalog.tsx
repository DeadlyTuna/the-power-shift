"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useInView, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";
import { pluralise } from "./course-helpers";

/**
 * The /courses grid with a category filter. Cards are rendered on the server
 * (CourseCard) and passed in, so this component only decides which to show.
 *
 * The filter is a group of toggle buttons (aria-pressed) with a sliding
 * indicator (layoutId). Cards stagger in the first time the grid scrolls into
 * view, and fade/re-flow when the filter changes. Without JavaScript the
 * filter is hidden and every course is shown.
 */

export type CatalogItem = { slug: string; category: string; card: ReactNode };

const ALL = "All";

/** `custom` is the entrance delay: staggered on first reveal, immediate after a filter change. */
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

export function CourseCatalog({ items, categories }: { items: CatalogItem[]; categories: readonly string[] }) {
  const [active, setActive] = useState<string>(ALL);
  const [filtered, setFiltered] = useState(false);
  const gridRef = useRef<HTMLUListElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.1 });
  const statusId = useId();
  const filters = [ALL, ...categories.filter((c) => items.some((i) => i.category === c))];
  const visible = active === ALL ? items : items.filter((i) => i.category === active);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between [html:not(.js)_&]:hidden">
        <LayoutGroup id="course-filter">
          <div
            role="group"
            aria-label="Filter courses by category"
            aria-describedby={statusId}
            className="-mx-1 flex flex-wrap gap-2 px-1"
          >
            {filters.map((filter) => {
              const selected = filter === active;
              const count = filter === ALL ? items.length : items.filter((i) => i.category === filter).length;
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setActive(filter);
                    setFiltered(true);
                  }}
                  className={cn(
                    "relative inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-[0.9375rem] font-semibold transition-colors duration-200",
                    selected
                      ? "border-transparent text-white"
                      : "border-line bg-white text-jamun-900 hover:border-jamun-200 hover:bg-mist",
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId="course-filter-indicator"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-jamun-900"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative">{filter}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative rounded-full px-1.5 text-xs leading-5 tabular-nums",
                      selected ? "bg-white/15 text-marigold-300" : "bg-mist text-muted",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <p id={statusId} aria-live="polite" className="text-[0.9375rem] text-muted">
          {active === ALL
            ? `Showing all ${pluralise(items.length, "course")}`
            : `Showing ${pluralise(visible.length, "course")} in ${active}`}
        </p>
      </div>

      <ul ref={gridRef} className="relative mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((course, index) => (
            <motion.li
              key={course.slug}
              layout
              data-reveal=""
              variants={item}
              custom={filtered ? 0 : Math.min(index, 8) * 0.08}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              exit="exit"
              className="flex"
            >
              {course.card}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
