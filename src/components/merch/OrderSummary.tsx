import { CircleCheck, Truck } from "lucide-react";
import { shipping } from "@/content/merch";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";
import { freeShippingGap, variantLabel, type PricedCart } from "@/lib/merch/pricing";
import { ProductArt } from "./ProductArt";

/** "Add ₹X more for free shipping", with a quiet progress bar. */
export function FreeShippingProgress({ subtotal, className }: { subtotal: number; className?: string }) {
  if (subtotal <= 0) return null;
  const gap = freeShippingGap(subtotal);
  const progress = Math.min(1, subtotal / shipping.freeAbove);
  return (
    <div className={className}>
      <p className="flex items-start gap-2 text-[0.9375rem] leading-snug">
        {gap > 0 ? (
          <>
            <Truck aria-hidden="true" className="mt-0.5 size-[1.125rem] shrink-0 text-marigold-700" />
            <span>
              Add <strong className="font-semibold text-jamun-900">{formatINR(gap)}</strong> more for free shipping.
            </span>
          </>
        ) : (
          <>
            <CircleCheck aria-hidden="true" className="mt-0.5 size-[1.125rem] shrink-0 text-peacock-600" />
            <span className="font-medium text-peacock-700">Your order ships free.</span>
          </>
        )}
      </p>
      <div aria-hidden="true" className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-mist">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-shift",
            gap > 0 ? "bg-marigold-400" : "bg-peacock-600",
          )}
          style={{ width: `${Math.max(4, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}

/** Subtotal, shipping and total, optionally with a compact list of the lines. */
export function OrderSummary({
  cart,
  showLines = false,
  className,
}: {
  cart: PricedCart;
  showLines?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {showLines ? (
        <ul className="flex flex-col gap-4 border-b border-line pb-5">
          {cart.lines.map((line) => {
            const option = variantLabel(line.product, line.variant);
            return (
              <li key={`${line.product.slug}-${line.variant ?? ""}`} className="flex items-center gap-3.5">
                <div className="relative w-14 shrink-0 overflow-hidden rounded-lg border border-line">
                  <ProductArt product={line.product} sizes="56px" />
                  <span className="absolute -top-0 -right-0 inline-flex min-w-5 items-center justify-center rounded-bl-lg bg-jamun-900 px-1 text-xs leading-5 font-bold text-white">
                    <span className="sr-only">Quantity </span>
                    {line.qty}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="leading-snug font-medium text-jamun-900">{line.product.name}</p>
                  <p className="text-sm text-muted">
                    {option ? `${option} · ` : ""}
                    {line.qty} × {formatINR(line.unitPrice)}
                  </p>
                </div>
                <p className="font-medium text-jamun-900 tabular-nums">{formatINR(line.lineTotal)}</p>
              </li>
            );
          })}
        </ul>
      ) : null}
      <dl className={cn("flex flex-col gap-2.5 text-[0.9875rem]", showLines && "pt-5")}>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular-nums">{formatINR(cart.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Shipping</dt>
          <dd className="tabular-nums">
            {cart.lines.length === 0 ? "–" : cart.shipping === 0 ? "Free" : formatINR(cart.shipping)}
          </dd>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-4 border-t border-line pt-3.5">
          <dt className="font-semibold text-jamun-900">Total</dt>
          <dd className="text-xl font-semibold text-jamun-900 tabular-nums">{formatINR(cart.total)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-right text-sm text-muted">Inclusive of all taxes</p>
    </div>
  );
}
