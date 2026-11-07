import type { JSX } from "react";
import type { CourseDetails, Program } from "@/content/programs";
import { cn } from "@/lib/cn";

/**
 * Generated cover art for a course, used until real artwork exists. Every
 * cover shares one 16:10 viewBox so grids line up, and is built from three
 * things in src/content/courses.ts:
 *
 *   accent    the palette colourway (marigold, peacock, jamun, kumkum)
 *   category  the motif: rising steps (Leadership), a voice carrying
 *             outwards (Confidence), a loop straightening into a line
 *             (Mindset), two overlapping circles (Relationships)
 *   title     set in Rozha One, wrapped to fit
 *
 * A small slug-seeded tilt keeps two covers with the same motif from looking
 * stamped. Palette tokens only (fill-/stroke- utilities). Decorative by
 * default; pass `label` when the cover stands alone.
 */

const W = 640;
const H = 400;

type Accent = CourseDetails["accent"];
type Category = CourseDetails["category"];

type Theme = {
  bg: string;
  /** Main motif colour. */
  shape: string;
  /** Secondary, quieter motif colour. */
  soft: string;
  /** The one bright highlight. */
  spark: string;
  stroke: string;
  dots: string;
  title: string;
  label: string;
  rule: string;
};

const themes: Record<Accent, Theme> = {
  marigold: {
    bg: "fill-marigold-200",
    shape: "fill-marigold-400",
    soft: "fill-marigold-300",
    spark: "fill-kumkum",
    stroke: "stroke-marigold-500",
    dots: "fill-jamun-900",
    title: "fill-jamun-950",
    label: "fill-marigold-700",
    rule: "fill-jamun-900",
  },
  peacock: {
    bg: "fill-peacock-600",
    shape: "fill-peacock-700",
    soft: "fill-peacock-50/15",
    spark: "fill-marigold-400",
    stroke: "stroke-peacock-50/60",
    dots: "fill-white",
    title: "fill-white",
    label: "fill-marigold-300",
    rule: "fill-marigold-400",
  },
  jamun: {
    bg: "fill-jamun-900",
    shape: "fill-jamun-700",
    soft: "fill-jamun-800",
    spark: "fill-marigold-400",
    stroke: "stroke-marigold-400",
    dots: "fill-white",
    title: "fill-white",
    label: "fill-marigold-300",
    rule: "fill-marigold-400",
  },
  kumkum: {
    bg: "fill-kumkum-50",
    shape: "fill-kumkum",
    soft: "fill-marigold-300",
    spark: "fill-jamun-900",
    stroke: "stroke-kumkum",
    dots: "fill-kumkum",
    title: "fill-jamun-900",
    label: "fill-kumkum",
    rule: "fill-kumkum",
  },
};

/* ---------- deterministic variation ---------- */

function seedOf(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/* ---------- title fitting (same approach as the merch mockups) ---------- */

/** Rozha One's average advance per em, slightly generous so text never overflows. */
const DISPLAY_CHAR = 0.52;

function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (!current) current = word;
    else if (`${current} ${word}`.length <= maxChars) current = `${current} ${word}`;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function fitTitle(text: string, width: number, maxSize: number, maxLines: number) {
  for (let size = maxSize; size >= 24; size -= 1) {
    const maxChars = Math.max(1, Math.floor(width / (size * DISPLAY_CHAR)));
    const lines = wrap(text, maxChars);
    if (lines.length <= maxLines && lines.every((l) => l.length <= maxChars)) return { lines, size };
  }
  return { lines: wrap(text, Math.floor(width / (24 * DISPLAY_CHAR))).slice(0, maxLines), size: 24 };
}

/* ---------- motifs ---------- */

type MotifProps = { t: Theme; seed: number };

/** Leadership: steps rising to the right, a marigold sun at the top. */
function Steps({ t, seed }: MotifProps) {
  const bars = [92, 146, 204, 266];
  const shift = seed % 24;
  return (
    <g>
      <circle cx={560 - shift} cy={150} r={150} className={t.soft} opacity={0.55} />
      {bars.map((h, i) => (
        <rect
          key={h}
          x={404 + i * 58 + shift / 2}
          y={H - h}
          width={46}
          height={h + 24}
          rx={12}
          className={i % 2 === 0 ? t.shape : t.soft}
          opacity={i % 2 === 0 ? 1 : 0.9}
        />
      ))}
      <circle cx={404 + 3 * 58 + 23 + shift / 2} cy={H - 266 - 46} r={22} className={t.spark} />
    </g>
  );
}

/** Confidence: a voice carrying outwards from one clear point. */
function Voice({ t, seed }: MotifProps) {
  const cx = 588;
  const cy = 196 + (seed % 30) - 15;
  const radii = [62, 104, 146, 188];
  // Arcs open towards the left, from 128° to 232°.
  const arc = (r: number) => {
    const a0 = (128 * Math.PI) / 180;
    const a1 = (232 * Math.PI) / 180;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy - r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy - r * Math.sin(a1);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  };
  return (
    <g>
      <circle cx={cx + 40} cy={cy} r={120} className={t.soft} opacity={0.8} />
      {radii.map((r, i) => (
        <path
          key={r}
          d={arc(r)}
          fill="none"
          strokeWidth={15}
          strokeLinecap="round"
          className={t.stroke}
          opacity={1 - i * 0.22}
        />
      ))}
      <circle cx={cx} cy={cy} r={30} className={t.shape} />
      <circle cx={cx} cy={cy} r={11} className={t.spark} />
    </g>
  );
}

/** Mindset: a loop that straightens into a line, the what-if spiral becoming a decision. */
function Loop({ t, seed }: MotifProps) {
  const tilt = (seed % 13) - 6;
  return (
    <g transform={`rotate(${tilt} 520 210)`}>
      <circle cx={548} cy={190} r={146} className={t.soft} opacity={0.7} />
      <path
        d="M392 356 C470 352 560 330 566 262 C572 204 512 182 488 222 C462 266 520 300 566 262 C590 242 602 196 614 150"
        fill="none"
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={t.stroke}
      />
      <circle cx={618} cy={128} r={15} className={t.spark} />
    </g>
  );
}

/** Relationships: two circles that overlap without either disappearing. */
function Overlap({ t, seed }: MotifProps) {
  const dy = (seed % 26) - 13;
  return (
    <g>
      <circle cx={498} cy={196 + dy} r={104} className={t.shape} opacity={0.92} />
      <circle cx={604} cy={196 - dy} r={104} className={t.soft} opacity={0.88} style={{ mixBlendMode: "multiply" }} />
      <circle cx={551} cy={196} r={12} className={t.spark} />
    </g>
  );
}

const motifs: Record<Category, (props: MotifProps) => JSX.Element> = {
  Leadership: Steps,
  Confidence: Voice,
  Mindset: Loop,
  Relationships: Overlap,
};

/** A soft dot field in the top band, fading towards the title. */
function Dots({ t }: { t: Theme }) {
  const dots: JSX.Element[] = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 18; col++) {
      const x = 300 + col * 18;
      const y = 26 + row * 18;
      const fade = (col / 17) * (1 - row / 7);
      if (fade < 0.08) continue;
      dots.push(<circle key={`${row}-${col}`} cx={x} cy={y} r={2} className={t.dots} opacity={0.32 * fade} />);
    }
  }
  return <g>{dots}</g>;
}

export type CourseCoverProps = {
  program: Pick<Program, "slug" | "title" | "course">;
  /** Accessible name. Omit when the cover is decorative (e.g. beside the course title). */
  label?: string;
  className?: string;
};

export function CourseCover({ program, label, className }: CourseCoverProps) {
  const course = program.course;
  const accent: Accent = course?.accent ?? "jamun";
  const category: Category = course?.category ?? "Leadership";
  const t = themes[accent];
  const seed = seedOf(program.slug);
  const Motif = motifs[category];

  const { lines, size } = fitTitle(program.title, 360, 50, 3);
  const leading = size * 1.04;
  const lastBaseline = H - 46;
  const firstBaseline = lastBaseline - (lines.length - 1) * leading;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block aspect-[16/10] h-auto w-full", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <rect width={W} height={H} className={t.bg} />
      <Dots t={t} />
      <Motif t={t} seed={seed} />

      <text x={40} y={58} className={cn("font-sans font-semibold", t.label)} fontSize={15} letterSpacing={2.6}>
        THE POWER SHIFT
      </text>
      <rect x={40} y={firstBaseline - size - 18} width={44} height={4} rx={2} className={t.rule} />
      <text x={40} y={firstBaseline} fontSize={size} className={cn("font-display", t.title)}>
        {lines.map((line, i) => (
          <tspan key={i} x={40} dy={i === 0 ? 0 : leading}>
            {line}
          </tspan>
        ))}
      </text>
    </svg>
  );
}
