import Image from "next/image";
import type { JSX } from "react";
import type { Product, ProductArt as ArtKey } from "@/content/merch";
import { cn } from "@/lib/cn";

/**
 * Illustrated product mockups, used until real photos are added
 * (set `image` on a product and this renders next/image instead).
 *
 * Every mockup shares one 4:5 viewBox so grids line up, uses palette
 * tokens only (via fill-/stroke- utilities), and sets the product's
 * printText in the brand faces. Light comes from the top left: shade sits
 * on right-hand edges, with one soft contact shadow under each object.
 */

const W = 400;
const H = 500;

type ArtProduct = Pick<Product, "art" | "printText" | "image" | "name">;

export type ProductArtProps = {
  product: ArtProduct;
  /** Accessible name. Omit when the art is decorative (e.g. next to the product name). */
  label?: string;
  className?: string;
  /** next/image `sizes`, used only when the product has a photo. */
  sizes?: string;
  priority?: boolean;
};

export function ProductArt({ product, label, className, sizes = "(min-width: 1024px) 400px, 50vw", priority }: ProductArtProps) {
  if (product.image) {
    return (
      <div className={cn("relative aspect-[4/5] overflow-hidden bg-mist", className)}>
        <Image
          src={product.image}
          alt={label ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const Art = arts[product.art];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block aspect-[4/5] h-auto w-full", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <rect width={W} height={H} className={backgrounds[product.art]} />
      <Art text={product.printText} />
    </svg>
  );
}

const backgrounds: Record<ArtKey, string> = {
  journal: "fill-mist",
  cards: "fill-peacock-50",
  mug: "fill-marigold-200",
  tote: "fill-jamun-100",
  tee: "fill-marigold-200",
  planner: "fill-peacock-50",
};

/* ------------------------------------------------------------------ */
/* Text fitting: wraps print text to a box and picks the largest size. */
/* ------------------------------------------------------------------ */

type Face = "display" | "hand" | "sans";

/** Average advance width per em, slightly generous so text never overflows. */
const charWidth: Record<Face, number> = { display: 0.53, hand: 0.5, sans: 0.56 };

function wrapWords(text: string, maxChars: number, breakSentences: boolean): string[] {
  const chunks = breakSentences ? text.split(/(?<=[.!?])\s+/) : [text];
  const lines: string[] = [];
  for (const chunk of chunks) {
    let current = "";
    for (const word of chunk.split(/\s+/).filter(Boolean)) {
      if (!current) current = word;
      else if (`${current} ${word}`.length <= maxChars) current = `${current} ${word}`;
      else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function fitText(
  text: string,
  opts: { width: number; maxSize: number; minSize?: number; maxLines: number; face: Face; breakSentences?: boolean },
): { lines: string[]; size: number } {
  const { width, maxSize, minSize = 10, maxLines, face, breakSentences = false } = opts;
  for (let size = maxSize; size >= minSize; size -= 1) {
    const maxChars = Math.max(1, Math.floor(width / (size * charWidth[face])));
    const lines = wrapWords(text, maxChars, breakSentences);
    if (lines.length <= maxLines && lines.every((l) => l.length <= maxChars)) return { lines, size };
  }
  const maxChars = Math.max(1, Math.floor(width / (minSize * charWidth[face])));
  return { lines: wrapWords(text, maxChars, breakSentences).slice(0, maxLines), size: minSize };
}

const faceClass: Record<Face, string> = { display: "font-display", hand: "font-hand", sans: "font-sans" };

/** Multi-line SVG text, vertically centred on `cy`. */
function PrintText({
  text,
  x,
  cy,
  width,
  maxSize,
  maxLines,
  face,
  className,
  anchor = "middle",
  leading = 1.08,
  breakSentences,
}: {
  text: string;
  x: number;
  cy: number;
  width: number;
  maxSize: number;
  maxLines: number;
  face: Face;
  className: string;
  anchor?: "start" | "middle";
  leading?: number;
  breakSentences?: boolean;
}) {
  const { lines, size } = fitText(text, { width, maxSize, maxLines, face, breakSentences });
  const lineHeight = size * leading;
  // Baseline of the first line so the block's optical centre sits on cy.
  const first = cy - ((lines.length - 1) * lineHeight) / 2 + size * 0.34;
  return (
    <text x={x} y={first} fontSize={size} textAnchor={anchor} className={cn(faceClass[face], className)}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

/** Measured height of fitted text, for placing elements beneath it. */
function textBlockHeight(text: string, opts: Parameters<typeof fitText>[1], leading = 1.08) {
  const { lines, size } = fitText(text, opts);
  return (lines.length - 1) * size * leading + size * 0.7;
}

function Shadow({ cx, cy, rx, ry = 11 }: { cx: number; cy: number; rx: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="fill-jamun-900/15" />;
}

/* ------------------------------------------------------------------ */
/* The six mockups                                                     */
/* ------------------------------------------------------------------ */

type ArtComponent = (props: { text: string }) => JSX.Element;

/** A5 hardback journal, standing, with an elastic band and an abstract reframe on the cover. */
const Journal: ArtComponent = ({ text }) => {
  const titleBox = { width: 128, maxSize: 34, maxLines: 3, face: "display" as const };
  const titleH = textBlockHeight(text, titleBox, 1.02);
  const titleCy = 196;
  const ruleY = titleCy + titleH / 2 + 16;
  return (
    <g>
      <Shadow cx={208} cy={396} rx={122} />
      {/* Page block, seen past the cover's right and bottom edges */}
      <path d="M112 100 H300 Q308 100 308 108 V380 Q308 388 300 388 H112 Z" className="fill-white" />
      {[298, 301.5, 305].map((x) => (
        <line key={x} x1={x} y1={108} x2={x} y2={380} className="stroke-jamun-200" strokeWidth={0.9} />
      ))}
      {[380, 383.5].map((y) => (
        <line key={y} x1={116} y1={y} x2={298} y2={y} className="stroke-jamun-200" strokeWidth={0.9} />
      ))}
      {/* Cover */}
      <path d="M92 90 H288 Q298 90 298 100 V368 Q298 378 288 378 H92 Z" className="fill-jamun-900" />
      <path d="M284 90 H288 Q298 90 298 100 V368 Q298 378 288 378 H284 Z" className="fill-jamun-950/40" />
      {/* Spine and hinge */}
      <rect x={92} y={90} width={20} height={288} className="fill-jamun-800" />
      <line x1={112.5} y1={90} x2={112.5} y2={378} className="stroke-jamun-950/50" strokeWidth={1.5} />
      {/* Debossed frame */}
      <rect x={126} y={108} width={124} height={252} rx={4} className="fill-none stroke-jamun-700" strokeWidth={1.2} />
      {/* Title */}
      <PrintText text={text} x={188} cy={titleCy} {...titleBox} leading={1.02} className="fill-marigold-300" />
      <rect x={174} y={ruleY} width={28} height={2.5} rx={1.25} className="fill-marigold-400" />
      {/* The reframe in miniature: a struck script, then a written shift */}
      <rect x={150} y={300} width={76} height={6} rx={3} className="fill-jamun-700" />
      <line x1={146} y1={303} x2={230} y2={302} className="stroke-kumkum" strokeWidth={3} strokeLinecap="round" />
      <path
        d="M152 330 c6 -9 10 -9 14 0 s8 9 13 0 s9 -9 13 0 s8 9 14 0 s8 -8 12 -2"
        className="fill-none stroke-marigold-300"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Elastic band, wrapping over the top and bottom edges */}
      <rect x={262} y={87} width={10} height={294} rx={2} className="fill-marigold-400" />
      <rect x={267.5} y={87} width={4.5} height={294} rx={1.5} className="fill-marigold-500" />
    </g>
  );
};

/** A keepsake box with two cards rising out of it: the script side behind, the shift side in front. */
const Cards: ArtComponent = ({ text }) => {
  const shiftBox = { width: 112, maxSize: 26, maxLines: 4, face: "hand" as const };
  const shiftH = textBlockHeight(text, shiftBox, 1.12);
  const shiftCy = -4;
  return (
    <g>
      <Shadow cx={202} cy={398} rx={118} />
      {/* Back card: the limiting script, struck through */}
      <g transform="translate(158 214) rotate(-10)">
        <rect x={-75} y={-105} width={150} height={210} rx={11} className="fill-white stroke-jamun-200" strokeWidth={1.2} />
        <text x={-57} y={-78} fontSize={9.5} letterSpacing={1.6} className="font-sans fill-muted font-semibold">
          SCRIPT
        </text>
        {[
          { y: -60, w: 58 },
          { y: -44, w: 46 },
          { y: -28, w: 52 },
        ].map((bar) => (
          <g key={bar.y}>
            <rect x={-57} y={bar.y} width={bar.w} height={7} rx={3.5} className="fill-jamun-200" />
            <line
              x1={-61}
              y1={bar.y + 3.8}
              x2={-53 + bar.w}
              y2={bar.y + 3.2}
              className="stroke-kumkum"
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
      {/* Front card: the shift, handwritten */}
      <g transform="translate(234 218) rotate(6)">
        <rect x={-75} y={-105} width={150} height={210} rx={11} className="fill-white stroke-jamun-200" strokeWidth={1.2} />
        <circle cx={-56} cy={-81.5} r={3} className="fill-marigold-400" />
        <text x={-48} y={-78} fontSize={9.5} letterSpacing={1.6} className="font-sans fill-peacock-700 font-semibold">
          SHIFT
        </text>
        <PrintText text={text} x={0} cy={shiftCy} {...shiftBox} leading={1.12} className="fill-peacock-600" />
        <path
          d={`M-30 ${shiftCy + shiftH / 2 + 12} q30 -7 60 -1`}
          className="fill-none stroke-marigold-400"
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <rect x={60} y={-105} width={15} height={210} rx={0} className="fill-jamun-900/[0.04]" />
      </g>
      {/* Box */}
      <rect x={96} y={290} width={210} height={104} rx={7} className="fill-jamun-900" />
      <rect x={96} y={290} width={210} height={9} rx={3} className="fill-jamun-950" />
      <path d="M290 299 H306 V387 Q306 394 299 394 H290 Z" className="fill-jamun-950/40" />
      <text x={196} y={346} fontSize={21} textAnchor="middle" className="font-display fill-marigold-300">
        The Power Shift
      </text>
      <rect x={182} y={358} width={28} height={2.5} rx={1.25} className="fill-marigold-400" />
    </g>
  );
};

/** A 330 ml ceramic mug, side on, with chai inside. */
const Mug: ArtComponent = ({ text }) => {
  const box = { width: 116, maxSize: 31, maxLines: 4, face: "display" as const, breakSentences: true };
  const h = textBlockHeight(text, box, 1.06);
  const cy = 272;
  return (
    <g>
      <Shadow cx={196} cy={392} rx={118} ry={12} />
      {/* Handle (behind the body) */}
      <path d="M244 214 C318 204 322 334 244 326" className="fill-none stroke-jamun-200" strokeWidth={26} strokeLinecap="round" />
      <path d="M244 214 C318 204 322 334 244 326" className="fill-none stroke-white" strokeWidth={21} strokeLinecap="round" />
      {/* Body */}
      <path d="M92 168 V364 C92 380 124 388 172 388 C220 388 252 380 252 364 V168 Z" className="fill-white" />
      <path d="M222 168 V387 C238 385 252 378 252 364 V168 Z" className="fill-jamun-900/[0.07]" />
      <path d="M96 370 C110 380 140 383 172 383 C204 383 234 380 248 370" className="fill-none stroke-jamun-200" strokeWidth={1.2} />
      {/* Rim, interior and chai */}
      <ellipse cx={172} cy={168} rx={80} ry={15} className="fill-white stroke-jamun-200" strokeWidth={1.2} />
      <ellipse cx={172} cy={169.5} rx={72} ry={11} className="fill-jamun-100" />
      <ellipse cx={172} cy={173} rx={66} ry={8} className="fill-marigold-700" />
      <ellipse cx={150} cy={171.5} rx={18} ry={2.2} className="fill-marigold-500/50" />
      {/* Print */}
      <PrintText text={text} x={166} cy={cy} {...box} leading={1.06} className="fill-jamun-900" />
      <rect x={152} y={cy + h / 2 + 12} width={28} height={2.5} rx={1.25} className="fill-marigold-400" />
    </g>
  );
};

/** A heavyweight canvas tote with long handles and a screen-printed reframe. */
const Tote: ArtComponent = ({ text }) => {
  const box = { width: 150, maxSize: 32, maxLines: 4, face: "display" as const };
  const h = textBlockHeight(text, box, 1.06);
  const cy = 300;
  const handle = "M146 222 V176 C146 64 254 64 254 176 V222";
  // The back handle sits directly behind, seen through the front handle's loop.
  const backHandle = "M160 188 C160 96 240 96 240 188";
  return (
    <g>
      <Shadow cx={202} cy={406} rx={124} />
      {/* Back handle */}
      <path d={backHandle} className="fill-none stroke-marigold-400/60" strokeWidth={14} strokeLinecap="round" />
      <path d={backHandle} className="fill-none stroke-marigold-300" strokeWidth={11} strokeLinecap="round" />
      {/* Bag */}
      <path d="M100 184 H300 L306 398 Q306 404 300 404 H100 Q94 404 94 398 Z" className="fill-marigold-200" />
      <path d="M282 184 H300 L306 398 Q306 404 300 404 H285 Z" className="fill-jamun-900/[0.06]" />
      <rect x={100} y={184} width={200} height={18} className="fill-marigold-300/45" />
      <line x1={101} y1={205.5} x2={299} y2={205.5} className="stroke-marigold-700/40" strokeWidth={1.1} strokeDasharray="4 4" />
      <line x1={96} y1={392} x2={304} y2={392} className="stroke-marigold-300" strokeWidth={1.2} />
      {/* Front handle, stitched down */}
      <path d={handle} className="fill-none stroke-marigold-400/60" strokeWidth={16} strokeLinecap="butt" />
      <path d={handle} className="fill-none stroke-marigold-200" strokeWidth={13} strokeLinecap="butt" />
      <path d={handle} className="fill-none stroke-marigold-700/35" strokeWidth={1} strokeDasharray="3 4" />
      {[146, 254].map((x) => (
        <g key={x} className="stroke-marigold-700/40" strokeWidth={1}>
          <rect x={x - 5.5} y={194} width={11} height={22} className="fill-none" strokeDasharray="3 2.5" />
          <line x1={x - 5.5} y1={194} x2={x + 5.5} y2={216} />
          <line x1={x + 5.5} y1={194} x2={x - 5.5} y2={216} />
        </g>
      ))}
      {/* Print */}
      <PrintText text={text} x={200} cy={cy} {...box} leading={1.06} className="fill-jamun-900" />
      <path
        d={`M168 ${cy + h / 2 + 14} q32 -8 64 -1`}
        className="fill-none stroke-peacock-600"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
};

/** A relaxed-fit tee on a hanger, the print handwritten. */
const Tee: ArtComponent = ({ text }) => {
  const box = { width: 140, maxSize: 34, maxLines: 4, face: "hand" as const };
  const h = textBlockHeight(text, box, 1.05);
  const cy = 248;
  const neckline = "M170 96 C176 115 189 122 200 122 C211 122 224 115 230 96";
  return (
    <g>
      <Shadow cx={200} cy={414} rx={116} ry={10} />
      {/* Hanger hook */}
      <path
        d="M200 96 V74 C200 66 211 63 213 54 C215 44 202 39 195 47"
        className="fill-none stroke-jamun-700"
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      {/* Inside of the back neck, with the hanger bar showing through */}
      <path d="M170 96 C184 90 216 90 230 96 C224 115 211 122 200 122 C189 122 176 115 170 96 Z" className="fill-jamun-950" />
      <rect x={146} y={95} width={108} height={8} rx={4} className="fill-marigold-700" />
      {/* Tee: relaxed fit, roughly 2:3 chest to length */}
      <path
        d="M170 96 C176 115 189 122 200 122 C211 122 224 115 230 96 L294 112 L354 170 L320 222 L288 200 L290 384 Q290 392 282 392 H118 Q110 392 110 384 L112 200 L80 222 L46 170 L106 112 Z"
        className="fill-jamun-900"
      />
      {/* Shade: right side and under the sleeves */}
      <path d="M270 196 L288 200 L290 384 Q290 392 282 392 H272 Z" className="fill-jamun-950/35" />
      <path d="M112 200 L134 188 L113 244 Z" className="fill-jamun-950/30" />
      <path d="M288 200 L266 188 L287 244 Z" className="fill-jamun-950/30" />
      {/* Rib and hems */}
      <path d={neckline} className="fill-none stroke-jamun-700" strokeWidth={5} strokeLinecap="round" />
      <line x1={53.5} y1={165.1} x2={87.5} y2={217.1} className="stroke-jamun-700" strokeWidth={2} />
      <line x1={346.5} y1={165.1} x2={312.5} y2={217.1} className="stroke-jamun-700" strokeWidth={2} />
      <line x1={111} y1={380} x2={289} y2={380} className="stroke-jamun-700" strokeWidth={2} />
      {/* Print */}
      <PrintText text={text} x={200} cy={cy} {...box} leading={1.05} className="fill-marigold-300" />
      <path
        d={`M172 ${cy + h / 2 + 14} q28 -7 56 -1`}
        className="fill-none stroke-marigold-400"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
};

/** An A4 tear-off desk pad: weekly focus, actions and reflection. */
const Planner: ArtComponent = ({ text }) => {
  const box = { width: 168, maxSize: 27, maxLines: 2, face: "display" as const };
  const titleH = textBlockHeight(text, box, 1.04);
  const titleCy = 140 + titleH / 2 - 10;
  const top = titleCy + titleH / 2 + 10;
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <g>
      <Shadow cx={204} cy={396} rx={122} />
      {/* Sheets beneath */}
      <rect x={100} y={98} width={208} height={292} rx={4} className="fill-white stroke-jamun-200" strokeWidth={1} />
      <rect x={97} y={95} width={208} height={292} rx={4} className="fill-white stroke-jamun-200" strokeWidth={1} />
      {/* Top sheet */}
      <rect x={94} y={92} width={208} height={292} rx={4} className="fill-white stroke-jamun-200" strokeWidth={1} />
      <path d="M290 108 H302 V380 Q302 384 298 384 H290 Z" className="fill-jamun-900/[0.04]" />
      {/* Glued binding */}
      <path d="M98 92 H298 Q302 92 302 96 V110 H94 V96 Q94 92 98 92 Z" className="fill-jamun-900" />
      {/* Heading */}
      <PrintText text={text} x={114} cy={titleCy} {...box} anchor="start" leading={1.04} className="fill-jamun-900" />
      <path
        d={`M114 ${top + 4} q40 -6 82 -1`}
        className="fill-none stroke-marigold-400"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Week tracker */}
      {days.map((d, i) => {
        const cx = 122 + i * 26;
        const done = i < 3;
        return (
          <g key={i}>
            <text x={cx} y={top + 30} fontSize={9.5} textAnchor="middle" className="font-sans fill-muted font-semibold">
              {d}
            </text>
            <circle
              cx={cx}
              cy={top + 46}
              r={8.5}
              className={done ? "fill-peacock-600" : "fill-none stroke-jamun-200"}
              strokeWidth={1.4}
            />
            {done ? (
              <path
                d={`M${cx - 3.8} ${top + 46.2} l2.6 2.7 l5 -5.4`}
                className="fill-none stroke-white"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </g>
        );
      })}
      {/* Actions */}
      {[0, 1, 2].map((i) => {
        const y = top + 76 + i * 25;
        return (
          <g key={i}>
            <rect x={114} y={y} width={12} height={12} rx={2.5} className="fill-none stroke-jamun-700" strokeWidth={1.4} />
            <line x1={134} y1={y + 12} x2={286} y2={y + 12} className="stroke-jamun-200" strokeWidth={1} />
            {i === 0 ? (
              <>
                <path
                  d={`M116.5 ${y + 6} l3 3 l5 -6.5`}
                  className="fill-none stroke-peacock-600"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={`M136 ${y + 8} c5 -7 8 -7 11 0 s7 6 10 0 s6 -7 10 0 s7 5 10 -1 s6 -6 9 0 s6 5 10 0`}
                  className="fill-none stroke-peacock-600"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                />
              </>
            ) : null}
          </g>
        );
      })}
      {/* Reflection */}
      <rect
        x={114}
        y={top + 156}
        width={172}
        height={Math.max(28, 366 - (top + 156))}
        rx={5}
        className="fill-mist/60 stroke-jamun-200"
        strokeWidth={1}
      />
    </g>
  );
};

const arts: Record<ArtKey, ArtComponent> = {
  journal: Journal,
  cards: Cards,
  mug: Mug,
  tote: Tote,
  tee: Tee,
  planner: Planner,
};
