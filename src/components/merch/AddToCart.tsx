"use client";

import { useId, useRef, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Product } from "@/content/merch";
import { whatsappLink } from "@/content/site";
import { useCart } from "@/components/cart/CartProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { variantLabel } from "@/lib/merch/pricing";
import { QuantityStepper } from "./QuantityStepper";

type Notice = { tone: "success" | "info"; text: string };

/** Variant chips, quantity stepper and "Add to cart", with an announced confirmation. */
export function AddToCart({ product, className }: { product: Product; className?: string }) {
  const { add, lines } = useCart();
  const uid = useId();
  const [variant, setVariant] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [variantError, setVariantError] = useState<string | undefined>(undefined);
  const firstOption = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (!product.inStock) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <p className="font-semibold text-jamun-900">Out of stock right now.</p>
        <ButtonLink
          href={whatsappLink(`Hi, will ${product.name} be back in stock?`)}
          variant="outline"
          size="lg"
          icon={<WhatsAppIcon />}
          className="self-start"
        >
          Ask about restocking on WhatsApp
        </ButtonLink>
      </div>
    );
  }

  const optionName = product.variants?.name ?? "Option";
  const inCart = lines.find((l) => l.slug === product.slug && (l.variant ?? "") === (variant ?? ""))?.qty ?? 0;
  const errorId = `${uid}-variant-error`;

  function handleAdd() {
    if (product.variants && !variant) {
      setVariantError(`Choose a ${optionName.toLowerCase()} first.`);
      setNotice(null);
      firstOption.current?.focus();
      return;
    }
    const room = product.maxQty - inCart;
    const added = Math.min(qty, room);
    const option = variantLabel(product, variant);
    const itemLabel = `${product.name}${option ? ` (${option})` : ""}`;
    if (added <= 0) {
      const text = `You already have ${product.maxQty} of ${itemLabel} in your cart, the most one order can hold.`;
      setNotice({ tone: "info", text });
      toast.info(text);
      return;
    }
    add(product.slug, variant, added);
    track("AddToCart", { value: product.price * added, currency: "INR", content_name: product.name });
    const total = inCart + added;
    const text =
      `Added ${added} × ${itemLabel} to your cart` +
      (total > added ? `. You now have ${total}.` : ".") +
      (added < qty ? ` That's the limit of ${product.maxQty} per order.` : "");
    setNotice({ tone: "success", text });
    // The toast is the announcement; the inline notice below stays as a visible record.
    toast.success("Added to cart", {
      description: text,
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {product.variants ? (
        <fieldset
          role="radiogroup"
          aria-required="true"
          aria-invalid={variantError ? true : undefined}
          aria-describedby={variantError ? errorId : undefined}
        >
          <legend className="text-[0.9375rem] font-semibold text-jamun-900">
            {optionName}
            {variant ? <span className="ml-2 font-normal text-muted">{variant}</span> : null}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.options.map((option, i) => (
              <label key={option} className="relative cursor-pointer">
                <input
                  ref={i === 0 ? firstOption : undefined}
                  type="radio"
                  name={`${uid}-variant`}
                  value={option}
                  checked={variant === option}
                  onChange={() => {
                    setVariant(option);
                    setVariantError(undefined);
                    setNotice(null);
                  }}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "inline-flex min-h-11 min-w-12 items-center justify-center rounded-full border bg-white px-4 font-semibold text-jamun-900 transition-colors duration-150",
                    "peer-hover:border-jamun-200 peer-checked:border-jamun-900 peer-checked:bg-jamun-900 peer-checked:text-white",
                    "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-jamun-900",
                    variantError ? "border-kumkum" : "border-line",
                  )}
                >
                  {option}
                </span>
              </label>
            ))}
          </div>
          {variantError ? (
            <p id={errorId} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-kumkum">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {variantError}
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <div className="flex flex-col gap-2">
        <span className="text-[0.9375rem] font-semibold text-jamun-900">
          Quantity
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper value={qty} max={product.maxQty} onChange={setQty} itemName={product.name} />
          <span className="text-sm text-muted">Up to {product.maxQty} per order</span>
        </div>
      </div>

      <Button size="lg" onClick={handleAdd} className="w-full sm:w-auto sm:self-start">
        Add to cart
      </Button>

      <div>
        {notice ? (
          <div
            className={cn(
              "flex flex-col gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
              notice.tone === "success" ? "border-peacock-600/30 bg-peacock-50" : "border-jamun-200 bg-mist",
            )}
          >
            <p className="flex items-start gap-2 text-[0.9375rem] text-jamun-950">
              {notice.tone === "success" ? (
                <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-peacock-600" />
              ) : null}
              <span>{notice.text}</span>
            </p>
            <ButtonLink href="/cart" variant="dark" size="sm" arrow className="shrink-0 self-start sm:self-auto">
              View cart
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}
