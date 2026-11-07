"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { getProduct } from "@/content/merch";
import { useCart, type CartLine } from "@/components/cart/CartProvider";
import { ButtonLink } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/Field";
import { Card } from "@/components/ui/Layout";
import { formatINR } from "@/lib/format";
import { priceCart, variantLabel } from "@/lib/merch/pricing";
import { FreeShippingProgress, OrderSummary } from "./OrderSummary";
import { ProductArt } from "./ProductArt";
import { QuantityStepper } from "./QuantityStepper";

const keyOf = (l: Pick<CartLine, "slug" | "variant">) => `${l.slug}::${l.variant ?? ""}`;

export function CartView() {
  const { lines, ready, setQty, remove } = useCart();
  const priced = useMemo(() => priceCart(lines), [lines]);
  const [announcement, setAnnouncement] = useState("");
  const nameLinks = useRef(new Map<string, HTMLAnchorElement>());
  const emptyHeading = useRef<HTMLHeadingElement>(null);
  const pendingFocus = useRef<{ index: number } | null>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const [summaryReached, setSummaryReached] = useState(false);
  const hasLines = ready && lines.length > 0;

  // Mobile sticky bar: shown until the order summary (with its own button) scrolls into view.
  useEffect(() => {
    const node = summaryRef.current;
    if (!hasLines || !node) return;
    const io = new IntersectionObserver(([entry]) => {
      setSummaryReached(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    io.observe(node);
    return () => io.disconnect();
  }, [hasLines]);

  // After a removal, move focus to the next item (or the empty state) so keyboard users aren't stranded.
  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = null;
    if (lines.length === 0) {
      emptyHeading.current?.focus();
      return;
    }
    const target = lines[Math.min(pending.index, lines.length - 1)];
    nameLinks.current.get(keyOf(target))?.focus();
  }, [lines]);

  if (!ready) {
    return (
      <div aria-busy="true" className="mt-10">
        <p className="sr-only" role="status">
          Loading your cart
        </p>
        <div aria-hidden="true" className="flex flex-col gap-6 lg:max-w-[calc(100%-26rem)]">
          {[0, 1].map((i) => (
            <div key={i} className="flex animate-pulse gap-4">
              <div className="aspect-[4/5] w-20 rounded-xl bg-mist sm:w-28" />
              <div className="flex flex-1 flex-col gap-3 pt-1">
                <div className="h-5 w-2/3 rounded bg-mist" />
                <div className="h-4 w-1/3 rounded bg-mist" />
                <div className="mt-2 h-11 w-36 rounded-full bg-mist" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mt-10">
        <p className="sr-only" role="status">
          {announcement}
        </p>
        <Card className="mx-auto flex max-w-xl flex-col items-center px-6 py-12 text-center sm:px-10">
          <span aria-hidden="true" className="inline-flex size-14 items-center justify-center rounded-full bg-mist text-jamun-900">
            <ShoppingBag className="size-6" />
          </span>
          <h2 ref={emptyHeading} tabIndex={-1} className="display-sm mt-5">
            Your cart is empty
          </h2>
          <p className="mt-3 max-w-sm text-muted">
            Find a journal, a deck of reframe cards or a small reminder for your desk.
          </p>
          <ButtonLink href="/merch" arrow className="mt-7">
            Browse the merch
          </ButtonLink>
        </Card>
      </div>
    );
  }

  function handleRemove(line: CartLine, index: number, name: string) {
    pendingFocus.current = { index };
    remove(line.slug, line.variant);
    setAnnouncement(`Removed ${name} from your cart.`);
  }

  return (
    <div className="mt-8">
      <p className="sr-only" role="status">
        {announcement}
      </p>
      <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
        <section aria-labelledby="cart-items-heading">
          <h2 id="cart-items-heading" className="sr-only">
            Items in your cart
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((line, index) => {
              const product = getProduct(line.slug);
              const key = keyOf(line);
              if (!product) {
                return (
                  <li key={key} className="flex items-center justify-between gap-4 py-5">
                    <p className="text-muted">This item is no longer in the shop.</p>
                    <RemoveButton onClick={() => handleRemove(line, index, "the unavailable item")} name="unavailable item" />
                  </li>
                );
              }
              const option = variantLabel(product, line.variant);
              return (
                <li key={key} className="flex gap-4 py-6 sm:gap-6">
                  <Link
                    href={`/merch/${product.slug}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="w-20 shrink-0 self-start overflow-hidden rounded-xl border border-line sm:w-28"
                  >
                    <ProductArt product={product} sizes="112px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg leading-tight sm:text-xl">
                          <Link
                            ref={(el) => {
                              if (el) nameLinks.current.set(key, el);
                              else nameLinks.current.delete(key);
                            }}
                            href={`/merch/${product.slug}`}
                            className="hover:text-jamun-700"
                          >
                            {product.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-muted">
                          {option ? `${option} · ` : ""}
                          {formatINR(product.price)} each
                        </p>
                      </div>
                      <p className="font-semibold text-jamun-900 tabular-nums">
                        <span className="sr-only">Line total </span>
                        {formatINR(product.price * line.qty)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <QuantityStepper
                        size="sm"
                        value={line.qty}
                        max={product.maxQty}
                        onChange={(next) => setQty(line.slug, line.variant, next)}
                        itemName={product.name}
                      />
                      <RemoveButton onClick={() => handleRemove(line, index, product.name)} name={product.name} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link
            href="/merch"
            className="mt-6 inline-flex min-h-11 items-center font-medium text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-[6px] hover:decoration-jamun-900"
          >
            Keep browsing
          </Link>
        </section>

        <aside ref={summaryRef} aria-labelledby="summary-heading" className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6 sm:p-7">
            <h2 id="summary-heading" className="display-sm">
              Order summary
            </h2>
            <FreeShippingProgress subtotal={priced.subtotal} className="mt-5" />
            <OrderSummary cart={priced} className="mt-6" />
            {priced.errors.length ? (
              <div className="mt-5">
                <FormAlert title="Some items need attention">
                  <ul className="mt-1 list-disc pl-5">
                    {priced.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </FormAlert>
              </div>
            ) : null}
            <ButtonLink href="/checkout" size="lg" arrow className="mt-6 w-full">
              Continue to checkout
            </ButtonLink>
          </Card>
        </aside>
      </div>

      {/* Mobile: keep the next step in reach until the summary's own button is on screen. */}
      <div
        data-print="hide"
        hidden={summaryReached}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <div className="leading-tight">
            <p className="text-sm text-muted">Total</p>
            <p className="text-lg font-semibold text-jamun-900 tabular-nums">{formatINR(priced.total)}</p>
          </div>
          <ButtonLink href="/checkout" arrow>
            Continue to checkout
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function RemoveButton({ onClick, name }: { onClick: () => void; name: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[0.9375rem] font-medium text-muted transition-colors hover:text-kumkum"
    >
      <Trash2 aria-hidden="true" className="size-4" />
      Remove<span className="sr-only"> {name}</span>
    </button>
  );
}
