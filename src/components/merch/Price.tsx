import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Price with the original struck through when there's a real compare-at price. */
export function Price({
  price,
  compareAt,
  size = "md",
  className,
}: {
  price: number;
  compareAt?: number;
  size?: "md" | "lg";
  className?: string;
}) {
  const reduced = typeof compareAt === "number" && compareAt > price;
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span
        className={cn(
          "font-semibold text-jamun-900 tabular-nums",
          size === "lg" ? "text-[1.75rem] leading-none" : "text-[1.0625rem] leading-tight",
        )}
      >
        {reduced ? <span className="sr-only">Now </span> : null}
        {formatINR(price)}
      </span>
      {reduced ? (
        <s className={cn("text-muted tabular-nums", size === "lg" ? "text-lg" : "text-[0.9375rem]")}>
          <span className="sr-only">, was </span>
          {formatINR(compareAt)}
        </s>
      ) : null}
    </p>
  );
}
