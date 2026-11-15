import Link from "next/link";
import type { ComponentProps, CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The home hero's one primary action: a marigold pill (the site's primary
 * button) with Magic UI's shimmer running around its edge. A link, not a
 * button, because it navigates. Built from the same keyframes as
 * src/components/kit/shimmer-button.tsx (shimmer-slide, spin-around in
 * globals.css), which the global reduced-motion rule stills.
 *
 * Use at most once per page.
 */
export function ShimmerLink({ className, children, style, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      style={
        {
          "--spread": "90deg",
          "--shimmer-color": "#ffffff",
          "--radius": "9999px",
          "--speed": "3.2s",
          "--cut": "0.09em",
          "--bg": "var(--color-marigold-400)",
          ...style,
        } as CSSProperties
      }
      className={cn(
        "group relative z-0 inline-flex min-h-14 items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-center text-[1.0625rem] leading-tight font-semibold text-jamun-950 [background:var(--bg)]",
        "shadow-[0_14px_30px_-14px_rgba(143,90,6,0.55),inset_0_-3px_0_rgba(42,22,54,0.18)] transition-[transform,box-shadow] duration-300 ease-shift",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_rgba(143,90,6,0.6),inset_0_-3px_0_rgba(42,22,54,0.18)] active:translate-y-px active:shadow-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      {/* The spark: a conic glint sliding round the edge. */}
      <span aria-hidden="true" className="absolute inset-0 -z-30 overflow-visible blur-[2px] @container-[size]">
        <span className="absolute inset-0 aspect-square h-[100cqh] animate-shimmer-slide rounded-none">
          <span className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
        </span>
      </span>

      {/* The face of the button, inset by --cut so only the edge shows the spark. */}
      <span
        aria-hidden="true"
        className="absolute inset-(--cut) -z-20 rounded-full [background:var(--bg)] transition-colors duration-200 group-hover:[background:var(--color-marigold-300)]"
      />

      <span className="relative">{children}</span>
      <ArrowRight
        aria-hidden="true"
        className="relative size-[1.1em] shrink-0 transition-transform duration-200 ease-shift group-hover:translate-x-1"
      />
    </Link>
  );
}
