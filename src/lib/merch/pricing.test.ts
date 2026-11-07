import { test } from "node:test";
import assert from "node:assert/strict";
import { products, shipping, type Product } from "@/content/merch";
import { MAX_CART_LINES, freeShippingGap, priceCart } from "./pricing";

/*
 * Rules are tested against a small fixture catalog so the boundaries are
 * exact; one test also prices the real catalog end to end.
 */

const fee = shipping.flatFee;

function fixture(overrides: Partial<Product> & Pick<Product, "slug" | "price">): Product {
  return {
    name: overrides.slug,
    tagline: "",
    description: "",
    details: [],
    category: "Cards",
    art: "cards",
    printText: "",
    inStock: true,
    maxQty: 10,
    ...overrides,
  };
}

const catalog = new Map<string, Product>(
  [
    fixture({ slug: "p998", price: 998 }),
    fixture({ slug: "p999", price: 999 }),
    fixture({ slug: "p1000", price: 1000 }),
    fixture({ slug: "p1", price: 1 }),
    fixture({ slug: "deck", price: 599 }),
    fixture({ slug: "tee", price: 899, maxQty: 5, variants: { name: "Size", options: ["S", "M", "L"] } }),
    fixture({ slug: "gone", price: 449, inStock: false }),
  ].map((p) => [p.slug, p]),
);
const lookup = (slug: string) => catalog.get(slug);

test("shipping fixture matches the rule these cases were written for", () => {
  assert.equal(shipping.freeAbove, 999);
  assert.ok(fee > 0);
});

test("free-shipping boundary: 998 pays shipping, 999 and 1000 ship free", () => {
  for (const [slug, subtotal, expectedShipping] of [
    ["p998", 998, fee],
    ["p999", 999, 0],
    ["p1000", 1000, 0],
  ] as const) {
    const cart = priceCart([{ slug, qty: 1 }], lookup);
    assert.deepEqual(cart.errors, []);
    assert.equal(cart.subtotal, subtotal);
    assert.equal(cart.shipping, expectedShipping, `shipping at ₹${subtotal}`);
    assert.equal(cart.total, subtotal + expectedShipping);
  }
});

test("free-shipping gap counts down to the threshold", () => {
  assert.equal(freeShippingGap(0), 0, "empty cart shows no gap");
  assert.equal(freeShippingGap(998), 1);
  assert.equal(freeShippingGap(999), 0);
  assert.equal(freeShippingGap(1000), 0);
});

test("totals add up across lines and variants", () => {
  const cart = priceCart(
    [
      { slug: "deck", qty: 2 },
      { slug: "tee", variant: "M", qty: 1 },
      { slug: "tee", variant: "L", qty: 3 },
    ],
    lookup,
  );
  assert.deepEqual(cart.errors, []);
  assert.equal(cart.lines.length, 3);
  assert.deepEqual(
    cart.lines.map((l) => [l.product.slug, l.variant, l.qty, l.unitPrice, l.lineTotal]),
    [
      ["deck", undefined, 2, 599, 1198],
      ["tee", "M", 1, 899, 899],
      ["tee", "L", 3, 899, 2697],
    ],
  );
  assert.equal(cart.subtotal, 4794);
  assert.equal(cart.shipping, 0);
  assert.equal(cart.total, 4794);
});

test("small order pays the flat fee", () => {
  const cart = priceCart([{ slug: "deck", qty: 1 }], lookup);
  assert.equal(cart.subtotal, 599);
  assert.equal(cart.shipping, fee);
  assert.equal(cart.total, 599 + fee);
});

test("empty cart costs nothing", () => {
  const cart = priceCart([], lookup);
  assert.deepEqual(cart.errors, []);
  assert.deepEqual([cart.subtotal, cart.shipping, cart.total], [0, 0, 0]);
});

test("unknown slug is rejected; valid lines are still priced", () => {
  const cart = priceCart(
    [
      { slug: "not-a-product", qty: 1 },
      { slug: "deck", qty: 1 },
    ],
    lookup,
  );
  assert.equal(cart.errors.length, 1);
  assert.equal(cart.lines.length, 1);
  assert.equal(cart.subtotal, 599);
});

test("variants: missing, invalid, and unexpected are rejected; empty string is ignored", () => {
  assert.equal(priceCart([{ slug: "tee", qty: 1 }], lookup).errors.length, 1, "missing variant");
  assert.equal(priceCart([{ slug: "tee", variant: "XXXL", qty: 1 }], lookup).errors.length, 1, "unknown variant");
  assert.equal(priceCart([{ slug: "deck", variant: "M", qty: 1 }], lookup).errors.length, 1, "variant on plain product");
  assert.deepEqual(priceCart([{ slug: "deck", variant: "", qty: 1 }], lookup).errors, [], "empty variant ignored");
  assert.deepEqual(priceCart([{ slug: "deck", variant: null, qty: 1 }], lookup).errors, [], "null variant ignored");
});

test("quantity must be a whole number from 1 to maxQty", () => {
  for (const qty of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 6]) {
    const cart = priceCart([{ slug: "tee", variant: "S", qty }], lookup);
    assert.equal(cart.errors.length, 1, `qty ${qty}`);
    assert.equal(cart.lines.length, 0);
    assert.equal(cart.total, 0);
  }
  assert.deepEqual(priceCart([{ slug: "tee", variant: "S", qty: 5 }], lookup).errors, [], "maxQty itself is allowed");
  assert.deepEqual(priceCart([{ slug: "tee", variant: "S", qty: 1 }], lookup).errors, [], "1 is allowed");
});

test("repeated lines are merged before the quantity limit is checked", () => {
  const cart = priceCart(
    [
      { slug: "tee", variant: "S", qty: 3 },
      { slug: "tee", variant: "S", qty: 3 },
    ],
    lookup,
  );
  assert.equal(cart.errors.length, 1);
  const ok = priceCart(
    [
      { slug: "tee", variant: "S", qty: 2 },
      { slug: "tee", variant: "S", qty: 3 },
    ],
    lookup,
  );
  assert.deepEqual(ok.errors, []);
  assert.equal(ok.lines.length, 1);
  assert.equal(ok.lines[0].qty, 5);
});

test("out-of-stock products are rejected", () => {
  const cart = priceCart([{ slug: "gone", qty: 1 }], lookup);
  assert.equal(cart.errors.length, 1);
  assert.equal(cart.lines.length, 0);
});

test(`more than ${MAX_CART_LINES} distinct lines is rejected`, () => {
  const big = new Map(catalog);
  for (let i = 0; i <= MAX_CART_LINES; i++) big.set(`x${i}`, fixture({ slug: `x${i}`, price: 1 }));
  const lines = Array.from({ length: MAX_CART_LINES + 1 }, (_, i) => ({ slug: `x${i}`, qty: 1 }));
  const over = priceCart(lines, (s) => big.get(s));
  assert.ok(over.errors.some((e) => e.includes(String(MAX_CART_LINES))));
  const atLimit = priceCart(lines.slice(0, MAX_CART_LINES), (s) => big.get(s));
  assert.deepEqual(atLimit.errors, []);
});

test("the real catalog prices without errors", () => {
  const lines = products
    .filter((p) => p.inStock)
    .map((p) => ({ slug: p.slug, variant: p.variants?.options[0], qty: 1 }));
  const cart = priceCart(lines);
  assert.deepEqual(cart.errors, []);
  const subtotal = products.filter((p) => p.inStock).reduce((s, p) => s + p.price, 0);
  assert.equal(cart.subtotal, subtotal);
  assert.equal(cart.total, subtotal + cart.shipping);
});
