import { getProduct, shipping, shippingFor, type Product } from "@/content/merch";

/**
 * Cart pricing. Pure and shared: the checkout API uses it as the
 * authoritative price (never the browser's numbers), and the cart and
 * checkout pages use it so shoppers see exactly what the server will charge.
 */

export type CartLineInput = { slug: string; variant?: string | null; qty: number };

export type PricedLine = {
  product: Product;
  variant?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
  /** Human-readable problems. When non-empty the cart can't be checked out. */
  errors: string[];
};

/** Most distinct items (product + variant) one order can hold. */
export const MAX_CART_LINES = 20;

const lineKey = (slug: string, variant?: string) => `${slug}::${variant ?? ""}`;

/**
 * Price a cart. `lookup` defaults to the catalog; tests pass their own.
 * Invalid lines are left out of the totals and explained in `errors`.
 */
export function priceCart(
  input: readonly CartLineInput[],
  lookup: (slug: string) => Product | undefined = getProduct,
): PricedCart {
  const errors: string[] = [];
  const lines: PricedLine[] = [];

  // Merge repeats of the same product + variant so limits apply to the real quantity.
  const merged = new Map<string, { slug: string; variant?: string; qty: number }>();
  for (const raw of input) {
    const variant = typeof raw.variant === "string" && raw.variant.trim() !== "" ? raw.variant.trim() : undefined;
    const key = lineKey(raw.slug, variant);
    const existing = merged.get(key);
    if (existing) existing.qty += raw.qty;
    else merged.set(key, { slug: raw.slug, variant, qty: raw.qty });
  }

  if (merged.size > MAX_CART_LINES) {
    errors.push(`An order can hold up to ${MAX_CART_LINES} different items. Remove some to continue.`);
  }

  for (const { slug, variant, qty } of merged.values()) {
    const product = lookup(slug);
    if (!product) {
      errors.push("One item in your cart is no longer in the shop. Remove it to continue.");
      continue;
    }
    if (!product.inStock) {
      errors.push(`${product.name} is out of stock. Remove it to continue.`);
      continue;
    }
    if (product.variants) {
      const option = product.variants.name.toLowerCase();
      if (!variant) {
        errors.push(`Choose a ${option} for ${product.name}.`);
        continue;
      }
      if (!product.variants.options.includes(variant)) {
        errors.push(`${product.name} doesn't come in ${option} ${variant}. Choose from ${product.variants.options.join(", ")}.`);
        continue;
      }
    } else if (variant) {
      errors.push(`${product.name} doesn't have options to choose from. Remove it and add it again.`);
      continue;
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > product.maxQty) {
      errors.push(`Choose between 1 and ${product.maxQty} of ${product.name}.`);
      continue;
    }

    lines.push({ product, variant, qty, unitPrice: product.price, lineTotal: product.price * qty });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shippingFee = shippingFor(subtotal);
  return { lines, subtotal, shipping: shippingFee, total: subtotal + shippingFee, errors };
}

/** Rupees still to add for free shipping; 0 once it applies (or the cart is empty). */
export function freeShippingGap(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return Math.max(0, shipping.freeAbove - subtotal);
}

/** "Size M" style label for a line's variant, or undefined. */
export function variantLabel(product: Product, variant?: string): string | undefined {
  if (!variant || !product.variants) return undefined;
  return `${product.variants.name} ${variant}`;
}
