/**
 * Merch catalog.
 *
 * SAMPLE CATALOG: these products, prices and descriptions are placeholders
 * designed around the brand. Replace them with the real range (and real
 * product photos via `image`) before taking live orders.
 *
 * Prices are in rupees, GST inclusive. The server always recomputes order
 * totals from this file; prices sent by the browser are never trusted.
 */

export type ProductArt = "journal" | "cards" | "mug" | "tote" | "tee" | "planner";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  details: string[];
  price: number;
  /** Original price, shown struck through when set. */
  compareAt?: number;
  category: "Journals & stationery" | "Cards" | "Drinkware" | "Bags" | "Apparel";
  /** Illustrated mockup used until a real photo is added. */
  art: ProductArt;
  /** Optional real product photo in /public, e.g. "/images/merch/journal.jpg". */
  image?: string;
  /** Text printed on the product, shown in the mockup. */
  printText: string;
  variants?: { name: string; options: string[] };
  inStock: boolean;
  /** Maximum quantity per order line. */
  maxQty: number;
};

export const merchIsSample = true;

export const products: Product[] = [
  {
    slug: "power-shift-journal",
    name: "The Power Shift Journal",
    tagline: "90 days of reframes, one page at a time",
    description:
      "A guided journal built around the twelve patterns in the Power Self-Assessment. Each day: notice a script, strike it through, write your shift.",
    details: ["A5, 192 pages, lay-flat binding", "90 guided daily pages + 12 weekly reviews", "Includes the Power Self-Assessment"],
    price: 749,
    category: "Journals & stationery",
    art: "journal",
    printText: "The Power Shift",
    inStock: true,
    maxQty: 10,
  },
  {
    slug: "reframe-card-deck",
    name: "Reframe Card Deck",
    tagline: "52 limiting scripts, 52 shifts",
    description:
      "One side carries a limiting script you might catch yourself thinking. Flip it over for the shift. Draw one each morning, or use the deck in team sessions.",
    details: ["52 cards + guide card", "Matte finish, rounded corners", "Keepsake box"],
    price: 599,
    category: "Cards",
    art: "cards",
    printText: "A clear no is a kind no.",
    inStock: true,
    maxQty: 10,
  },
  {
    slug: "lead-inspire-succeed-mug",
    name: "Lead. Inspire. Succeed. Mug",
    tagline: "For the first decision of the day",
    description: "A sturdy ceramic mug for the desk where the big calls get made.",
    details: ["330 ml ceramic", "Dishwasher and microwave safe", "Printed in India"],
    price: 449,
    category: "Drinkware",
    art: "mug",
    printText: "Lead. Inspire. Succeed.",
    inStock: true,
    maxQty: 10,
  },
  {
    slug: "clear-no-tote",
    name: "A Clear No Tote",
    tagline: "Carry your boundaries with you",
    description: "A heavyweight cotton tote with the reframe that changes the most conversations.",
    details: ["100% cotton canvas, 280 GSM", "38 × 42 cm with inner pocket", "Long handles for shoulder carry"],
    price: 549,
    category: "Bags",
    art: "tote",
    printText: "A clear no is a kind no.",
    inStock: true,
    maxQty: 10,
  },
  {
    slug: "progress-over-perfection-tee",
    name: "Progress over Perfection Tee",
    tagline: "A reminder you can wear",
    description: "A soft, relaxed-fit cotton tee. Because perfection is the enemy of progress.",
    details: ["100% combed cotton, 180 GSM", "Relaxed unisex fit", "Size up for an oversized look"],
    price: 899,
    category: "Apparel",
    art: "tee",
    printText: "Progress over perfection",
    variants: { name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
    inStock: true,
    maxQty: 5,
  },
  {
    slug: "power-focus-planner",
    name: "Power Focus Desk Planner",
    tagline: "One power focus per week",
    description:
      "An undated weekly desk pad. Choose the one pattern costing you the most, set one action, and track it through the week.",
    details: ["A4 tear-off pad, 52 sheets", "Undated: start any week", "Weekly focus, actions and reflection"],
    price: 499,
    category: "Journals & stationery",
    art: "planner",
    printText: "My power focus",
    inStock: true,
    maxQty: 10,
  },
];

export const shipping = {
  /** Flat shipping fee in rupees, waived at or above `freeAbove`. */
  flatFee: 79,
  freeAbove: 999,
  region: "India",
  dispatch: "Dispatched within 2–4 business days",
  delivery: "Delivered in 4–8 business days after dispatch",
};

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= shipping.freeAbove ? 0 : shipping.flatFee;
}
