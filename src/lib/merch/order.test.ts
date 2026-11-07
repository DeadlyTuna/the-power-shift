import { test } from "node:test";
import assert from "node:assert/strict";
import { products } from "@/content/merch";
import { compactItems, isOrderReference, orderReference, whatsappOrderMessage } from "./order";
import { priceCart } from "./pricing";
import { merchCheckoutSchema } from "./schema";

const plain = products.find((p) => p.inStock && !p.variants)!;
const sized = products.find((p) => p.inStock && p.variants)!;

test("order references are PSM- plus an upper-case base-36 timestamp", () => {
  const now = 1_790_000_000_000;
  const ref = orderReference(now);
  assert.equal(ref, `PSM-${now.toString(36).toUpperCase()}`);
  assert.ok(isOrderReference(ref));
  assert.ok(!isOrderReference("PSM-<script>"));
  assert.ok(!isOrderReference("a@b.com"));
});

test("compact items and the WhatsApp message carry items and totals only", () => {
  const cart = priceCart([
    { slug: plain.slug, qty: 2 },
    { slug: sized.slug, variant: sized.variants!.options[1], qty: 1 },
  ]);
  assert.equal(compactItems(cart), `${plain.slug}:-:2,${sized.slug}:${sized.variants!.options[1]}:1`);
  const message = whatsappOrderMessage("PSM-TEST", cart);
  assert.match(message, /PSM-TEST/);
  assert.match(message, new RegExp(plain.name));
  assert.ok(!/@/.test(message), "no email in the message");
});

const valid = {
  customer: { name: "Asha Rao", email: "asha@example.com", phone: "98765 43210" },
  address: { line1: "12 MG Road", line2: "", city: "Bengaluru", state: "Karnataka", pin: "560001" },
  lines: [{ slug: plain.slug, qty: 1 }],
  consent: true,
  website: "",
};

test("checkout schema accepts a valid order and normalises the phone", () => {
  const parsed = merchCheckoutSchema.safeParse(valid);
  assert.ok(parsed.success);
  assert.equal(parsed.data.customer.phone, "+919876543210");
});

test("checkout schema rejects PIN codes that start with 0 or aren't 6 digits", () => {
  for (const pin of ["060001", "56001", "5600011", "56000a"]) {
    const parsed = merchCheckoutSchema.safeParse({ ...valid, address: { ...valid.address, pin } });
    assert.ok(!parsed.success, pin);
    assert.deepEqual(parsed.error.issues[0].path, ["address", "pin"]);
  }
});

test("checkout schema rejects non-Indian mobiles, unknown states, missing consent and empty carts", () => {
  assert.ok(!merchCheckoutSchema.safeParse({ ...valid, customer: { ...valid.customer, phone: "+14155550123" } }).success);
  assert.ok(!merchCheckoutSchema.safeParse({ ...valid, address: { ...valid.address, state: "Atlantis" } }).success);
  assert.ok(!merchCheckoutSchema.safeParse({ ...valid, consent: false }).success);
  assert.ok(!merchCheckoutSchema.safeParse({ ...valid, lines: [] }).success);
});
