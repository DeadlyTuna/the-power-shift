import Link from "next/link";
import { MapPin, PackageCheck, ReceiptText, Truck } from "lucide-react";
import { shipping } from "@/content/merch";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Shipping and returns facts, straight from the merch content.
 * Return terms live on the refund policy page, so this links there rather
 * than restating (or inventing) them.
 */
export function shippingFacts() {
  return [
    {
      Icon: Truck,
      title: `Free shipping from ${formatINR(shipping.freeAbove)}`,
      body: `Orders of ${formatINR(shipping.freeAbove)} or more ship free. Below that, shipping is a flat ${formatINR(shipping.flatFee)}.`,
    },
    {
      Icon: PackageCheck,
      title: shipping.dispatch,
      body: `${shipping.delivery}.`,
    },
    {
      Icon: MapPin,
      title: `Shipping within ${shipping.region}`,
      body: "Add your address and 6-digit PIN code at checkout.",
    },
  ];
}

export function ShippingNotes({ layout = "strip", className }: { layout?: "strip" | "list"; className?: string }) {
  const facts = shippingFacts();
  const strip = layout === "strip";
  return (
    <div className={className}>
      <ul className={cn("grid gap-6", strip && "sm:grid-cols-2 lg:grid-cols-4 lg:gap-8")}>
        {facts.map(({ Icon, title, body }) => (
          <li key={title} className="flex gap-3.5">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-jamun-900 ring-1 ring-line"
            >
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-semibold leading-snug text-jamun-900">{title}</p>
              <p className="mt-1 text-[0.9375rem] leading-snug text-muted">{body}</p>
            </div>
          </li>
        ))}
        <li className="flex gap-3.5">
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-jamun-900 ring-1 ring-line"
          >
            <ReceiptText className="size-5" />
          </span>
          <div>
            <p className="font-semibold leading-snug text-jamun-900">Returns and refunds</p>
            <p className="mt-1 text-[0.9375rem] leading-snug text-muted">
              See the{" "}
              <Link href="/refund-policy" className="font-medium text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900">
                refund policy
              </Link>{" "}
              and{" "}
              <Link href="/shipping-policy" className="font-medium text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900">
                shipping policy
              </Link>
              .
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
}
