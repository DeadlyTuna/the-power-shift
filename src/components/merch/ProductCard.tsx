import Link from "next/link";
import type { Product } from "@/content/merch";
import { Badge, Card } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";
import { Price } from "./Price";
import { ProductArt } from "./ProductArt";

/**
 * Product tile for grids (merch page, related products, home page).
 * The whole card is clickable through the name's stretched link, so there's
 * a single, well-labelled link per product for keyboard and screen readers.
 */
export function ProductCard({
  product,
  className,
  headingLevel = "h3",
}: {
  product: Product;
  className?: string;
  /** Heading level for the product name, to fit the surrounding outline. */
  headingLevel?: "h2" | "h3" | "h4";
}) {
  const Heading = headingLevel;
  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden transition-colors duration-200 hover:border-jamun-200 has-[a:focus-visible]:border-jamun-700",
        className,
      )}
    >
      <div className="overflow-hidden">
        <ProductArt
          product={product}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 50vw"
          className="transition-transform duration-500 ease-shift group-hover:scale-[1.025]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <p className="eyebrow text-[0.6875rem] text-marigold-700 sm:text-[0.75rem]">{product.category}</p>
        <Heading className="mt-2 font-display text-[1.1875rem] leading-[1.15] sm:text-2xl">
          <Link
            href={`/merch/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] hover:text-jamun-700"
          >
            {product.name}
          </Link>
        </Heading>
        <p className="mt-1.5 text-[0.9375rem] leading-snug text-muted">{product.tagline}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
          <Price price={product.price} compareAt={product.compareAt} />
          {!product.inStock ? <Badge tone="outline" className="text-muted">Out of stock</Badge> : null}
        </div>
      </div>
    </Card>
  );
}
