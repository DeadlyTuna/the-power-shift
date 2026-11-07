"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import type { Product } from "@/content/merch";
import { cn } from "@/lib/cn";
import { ProductCard } from "./ProductCard";

const ALL = "All";

/** Category chips and the product grid. Filter state stays on the page, not in the URL. */
export function MerchCatalog({ products }: { products: Product[] }) {
  const [active, setActive] = useState<string>(ALL);

  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const p of products) if (!seen.includes(p.category)) seen.push(p.category);
    return seen;
  }, [products]);

  const visible = active === ALL ? products : products.filter((p) => p.category === active);
  const countLabel = `${visible.length} ${visible.length === 1 ? "product" : "products"}`;

  return (
    <div>
      {categories.length > 1 ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {[ALL, ...categories].map((category) => {
              const pressed = active === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setActive(category)}
                  className={cn(
                    "relative inline-flex min-h-11 items-center rounded-full border px-4 text-[0.9375rem] font-medium transition-colors duration-200",
                    pressed
                      ? "border-jamun-900 text-white"
                      : "border-line bg-white text-jamun-900 hover:border-jamun-200 hover:bg-mist",
                  )}
                >
                  {pressed ? (
                    <motion.span
                      layoutId="merch-filter-active"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-jamun-900"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative">{category}</span>
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="text-[0.9375rem] text-muted">
            {active === ALL ? `All ${countLabel}` : `${countLabel} in ${active}`}
          </p>
        </div>
      ) : null}

      <LayoutGroup>
        <motion.ul layout className="mt-8 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((product, i) => (
              <motion.li
                key={product.slug}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, delay: Math.min(i, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
              >
                <ProductCard product={product} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
    </div>
  );
}
