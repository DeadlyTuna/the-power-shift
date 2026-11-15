import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/motion/Reveal";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8", className)} {...props} />;
}

export type SectionTone = "paper" | "white" | "mist" | "jamun";

const tones: Record<SectionTone, string> = {
  paper: "bg-paper",
  white: "bg-white",
  mist: "bg-mist",
  jamun: "bg-jamun-900 text-jamun-100",
};

/** A full-width page band with consistent vertical rhythm. */
export function Section({
  tone = "paper",
  className,
  containerClassName,
  children,
  bare,
  ...props
}: ComponentProps<"section"> & {
  tone?: SectionTone;
  containerClassName?: string;
  /** Skip the inner Container (for full-bleed layouts). */
  bare?: boolean;
}) {
  return (
    <section data-tone={tone} className={cn(tones[tone], "py-20 md:py-28", className)} {...props}>
      {bare ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  );
}

/** Eyebrow label + heading + optional intro, used at the top of most sections. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "light",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className={cn("eyebrow mb-4", tone === "dark" ? "text-marigold-300" : "text-marigold-700")}>{eyebrow}</p>
      ) : null}
      <Heading className={cn("display-lg", tone === "dark" ? "text-white" : "text-jamun-900")}>{title}</Heading>
      {intro ? (
        <div className={cn("lede mt-5", tone === "dark" ? "text-jamun-100" : "text-muted")}>{intro}</div>
      ) : null}
    </Reveal>
  );
}

export type BadgeTone = "marigold" | "peacock" | "kumkum" | "jamun" | "outline";

const badgeTones: Record<BadgeTone, string> = {
  marigold: "bg-marigold-200 text-jamun-950",
  peacock: "bg-peacock-50 text-peacock-700",
  kumkum: "bg-kumkum-50 text-kumkum",
  jamun: "bg-jamun-900 text-white",
  outline: "border border-current/30 text-current",
};

export function Badge({ tone = "marigold", className, ...props }: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm leading-none font-semibold",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** White surface with the standard border and radius. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-card border border-line bg-white", className)} {...props} />;
}
