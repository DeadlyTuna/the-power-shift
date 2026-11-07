import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Buttons and button-styled links.
 * The trailing arrow nudges right on hover: a small "shift" that echoes the brand.
 */

export type ButtonVariant = "primary" | "dark" | "outline" | "on-dark" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full text-center font-semibold leading-tight transition-[background-color,color,border-color,box-shadow] duration-200 ease-shift disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-marigold-400 text-jamun-950 shadow-[inset_0_-3px_0_rgba(42,22,54,0.18)] hover:bg-marigold-300 active:shadow-none",
  dark: "bg-jamun-900 text-white hover:bg-jamun-800",
  outline: "border border-jamun-900/25 bg-transparent text-jamun-900 hover:border-jamun-900 hover:bg-white",
  "on-dark": "border border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10",
  link: "rounded-none px-0 text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-[6px] hover:decoration-jamun-900",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-[0.9375rem]",
  md: "min-h-12 px-6 py-3 text-base",
  lg: "min-h-14 px-8 py-3.5 text-[1.0625rem]",
};

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show the trailing arrow. */
  arrow?: boolean;
  icon?: ReactNode;
};

export function buttonClasses({ variant = "primary", size = "md" }: Pick<StyleProps, "variant" | "size"> = {}) {
  return cn(base, variants[variant], variant !== "link" && sizes[size]);
}

function Content({ children, arrow, icon }: { children: ReactNode; arrow?: boolean; icon?: ReactNode }) {
  return (
    <>
      {icon ? <span className="shrink-0 [&>svg]:size-[1.15em]">{icon}</span> : null}
      <span>{children}</span>
      {arrow ? (
        <ArrowRight
          aria-hidden="true"
          className="size-[1.1em] shrink-0 transition-transform duration-200 ease-shift group-hover:translate-x-1"
        />
      ) : null}
    </>
  );
}

export function Button({
  variant,
  size,
  arrow,
  icon,
  className,
  children,
  type = "button",
  ...props
}: StyleProps & ComponentProps<"button">) {
  return (
    <button type={type} className={cn(buttonClasses({ variant, size }), className)} {...props}>
      <Content arrow={arrow} icon={icon}>
        {children}
      </Content>
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  arrow,
  icon,
  className,
  children,
  href,
  ...props
}: StyleProps & ComponentProps<typeof Link>) {
  const external = typeof href === "string" && /^(https?:|mailto:|tel:)/.test(href);
  return (
    <Link
      href={href}
      className={cn(buttonClasses({ variant, size }), className)}
      {...(external && typeof href === "string" && href.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      {...props}
    >
      <Content arrow={arrow} icon={icon}>
        {children}
      </Content>
    </Link>
  );
}
