import type { ReactNode } from "react";
import { MagicCard } from "@/components/kit/magic-card";
import { cn } from "@/lib/cn";

/**
 * The card surface shared by program and course cards: a white card whose
 * border warms from marigold to peacock around the pointer, with a soft
 * marigold spotlight and a gentle lift on hover (hover-capable devices only).
 * Children are laid out as a full-height flex column, so footers can use
 * mt-auto to line up across a grid row.
 */
export function SpotlightCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <MagicCard
      className={cn(
        "flex h-full flex-col rounded-card transition-[translate,box-shadow] duration-300 ease-shift",
        "hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_rgba(42,22,54,0.45)]",
        // MagicCard wraps children in its last child; let that wrapper fill the card.
        "[&>:last-child]:flex [&>:last-child]:flex-1 [&>:last-child]:flex-col",
        className,
      )}
      gradientSize={280}
      gradientFrom="var(--color-marigold-400)"
      gradientTo="var(--color-peacock-600)"
      gradientColor="var(--color-marigold-200)"
      gradientOpacity={0.45}
    >
      {children}
    </MagicCard>
  );
}
