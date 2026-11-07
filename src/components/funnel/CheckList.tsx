import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";

/**
 * A plain list with check marks (benefits) or dots (pains, gaps, anything
 * that isn't a gain). Unordered on purpose: no numbers.
 *
 * `reveal` lets the items arrive one after another as the list scrolls into view.
 */
export function CheckList({
  items,
  tone = "light",
  size = "md",
  marker = "check",
  reveal = false,
  className,
}: {
  items: ReactNode[];
  tone?: "light" | "dark";
  size?: "md" | "lg";
  marker?: "check" | "dot";
  reveal?: boolean;
  className?: string;
}) {
  const dark = tone === "dark";
  const lg = size === "lg";
  const List = reveal ? StaggerList : "ul";
  const Item = reveal ? StaggerListItem : "li";
  return (
    <List className={cn("flex flex-col", lg ? "gap-5" : "gap-3.5", className)}>
      {items.map((item, i) => (
        <Item
          key={i}
          className={cn(
            "flex items-start gap-3",
            lg ? "text-lg sm:text-xl" : "text-[1.0625rem]",
            dark ? "text-jamun-100" : "text-ink",
          )}
        >
          {marker === "dot" ? (
            <span aria-hidden="true" className="mt-[0.6em] size-2 shrink-0 rounded-full bg-marigold-400" />
          ) : (
            <span
              className={cn(
                "mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full",
                lg ? "size-7" : "size-6",
                dark ? "bg-marigold-400 text-jamun-950" : "bg-peacock-50 text-peacock-700",
              )}
            >
              <Check aria-hidden="true" className={lg ? "size-4" : "size-3.5"} strokeWidth={3} />
            </span>
          )}
          <span>{item}</span>
        </Item>
      ))}
    </List>
  );
}
