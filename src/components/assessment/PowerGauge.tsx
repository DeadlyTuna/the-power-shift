import { bands } from "@/content/assessment";
import { MAX_TOTAL } from "@/lib/assessment/scoring";
import { cn } from "@/lib/cn";

/**
 * Half-circle gauge for the 0–100 power score. The track is split where the
 * result bands change, so the needle visibly lands inside its band.
 */

const CX = 100;
const CY = 100;
const R = 80;
const STROKE = 16;

/** Point on the arc for a 0–100 value (0 = left end, 100 = right end). */
function pointAt(value: number, radius = R): [number, number] {
  const angle = Math.PI * (1 - value / 100);
  return [CX + radius * Math.cos(angle), CY - radius * Math.sin(angle)];
}

const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

/** Band edges on the power scale, halfway between one band's top total and the next band's bottom total. */
const BAND_EDGES = bands.slice(0, -1).map((b) => ((MAX_TOTAL - (b.max + 0.5)) / MAX_TOTAL) * 100);

export function PowerGauge({ score, className }: { score: number; className?: string }) {
  const value = Math.min(100, Math.max(0, score));
  const [dotX, dotY] = pointAt(value);
  const label = `Power score: ${score} out of 100`;

  return (
    <figure className={cn("flex flex-col items-center", className)}>
      <svg viewBox="0 0 200 126" role="img" aria-label={label} className="w-full max-w-[18rem]">
        <title>{label}</title>
        <path d={ARC} pathLength={100} fill="none" strokeWidth={STROKE} strokeLinecap="round" className="stroke-jamun-100" />
        {value > 0 ? (
          <path
            d={ARC}
            pathLength={100}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${value} 100`}
            className="stroke-peacock-600"
          />
        ) : null}
        {BAND_EDGES.map((edge) => {
          const [x1, y1] = pointAt(edge, R - STROKE / 2 - 1);
          const [x2, y2] = pointAt(edge, R + STROKE / 2 + 1);
          return <line key={edge} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2.5} className="stroke-white" />;
        })}
        <circle cx={dotX} cy={dotY} r={10} strokeWidth={3.5} className="fill-marigold-400 stroke-white" />
        <text x={CX} y={CY - 6} textAnchor="middle" className="fill-jamun-900 font-display text-[3rem]">
          {score}
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" className="fill-muted font-sans text-[0.6875rem] font-semibold tracking-[0.12em] uppercase">
          out of 100
        </text>
        <text x={CX - R} y={CY + 24} textAnchor="middle" className="fill-muted font-sans text-[0.6875rem]">
          0
        </text>
        <text x={CX + R} y={CY + 24} textAnchor="middle" className="fill-muted font-sans text-[0.6875rem]">
          100
        </text>
      </svg>
      <figcaption className="mt-3 max-w-[18rem] text-center text-[0.9375rem] leading-snug text-muted">
        Your power score. The higher it is, the more of your power is in your hands.
      </figcaption>
    </figure>
  );
}
