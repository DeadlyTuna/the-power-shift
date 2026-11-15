import { z } from "zod";
import {
  answerOptions,
  bands,
  patterns,
  statements,
  type AnswerValue,
  type Band,
  type Pattern,
  type Statement,
} from "../../content/assessment";

/**
 * Scoring for the Power Self-Assessment. Pure TypeScript: no React, no I/O,
 * so the browser and the API route compute exactly the same result.
 *
 * Every statement scores Often = 2, Sometimes = 1, Rarely = 0 (from
 * `answerOptions`). A higher total means more power is leaking; the headline
 * power score flips that into 0–100 where higher is better.
 */

export type Answers = Record<number, AnswerValue>;

export type PatternLevel = "strong" | "watch" | "leak";

export type PatternResult = {
  pattern: Pattern;
  /** 0–6: the sum of the pattern's three statements. */
  score: number;
  level: PatternLevel;
  statementIds: number[];
};

export type AssessmentResult = {
  /** 0–24, higher = more power leaking. */
  total: number;
  /** 0–100, higher = more power in your hands. */
  powerScore: number;
  band: Band;
  /** One entry per pattern, in content order. */
  patterns: PatternResult[];
  oftenIds: number[];
  sometimesIds: number[];
  /**
   * The highest-scoring pattern(s). `dominant[0]` is the primary pattern;
   * any others share the same score. Ordered by more "often" answers, then
   * content order. Empty when no pattern scores above 1.
   */
  dominant: Pattern[];
  /** The statement the person chose as their power focus, if it was a valid choice. */
  focus: Statement | null;
  recommendedProgramSlug: string;
};

const POINTS: ReadonlyMap<AnswerValue, number> = new Map(answerOptions.map((o) => [o.value, o.points]));

export const MAX_POINTS = Math.max(...answerOptions.map((o) => o.points));
export const MAX_TOTAL = statements.length * MAX_POINTS;

/** A total at or above this recommends 1:1 coaching (the "Power Leaking" band and above). */
export const HIGH_LEAK_TOTAL = 13;
export const HIGH_LEAK_PROGRAM = "one-to-one-coaching";
/** Recommended when no pattern stands out. */
export const DEFAULT_PROGRAM = "leadership-confidence-workshop";

export class AssessmentAnswerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentAnswerError";
  }
}

/* ---------- Schemas (shared with the API route) ---------- */

const answerValues = answerOptions.map((o) => o.value) as [AnswerValue, ...AnswerValue[]];

export const answerValueSchema = z.enum(answerValues, {
  error: (issue) => (issue.input === undefined ? "Answer every statement" : "Choose Often, Sometimes or Rarely"),
});

const answersShape: Record<string, typeof answerValueSchema> = Object.fromEntries(
  statements.map((s) => [String(s.id), answerValueSchema]),
);

/** All twelve answers keyed by statement id, e.g. { "1": "often", …, "12": "rarely" }. Unknown keys are rejected. */
export const answersSchema = z
  .strictObject(answersShape, { error: "Answer every statement before sending your results" })
  .transform((raw): Answers => {
    const out: Answers = {};
    for (const s of statements) out[s.id] = raw[String(s.id)];
    return out;
  });

/** The statement chosen as the power focus. Optional; `computeResult` re-validates it against the answers. */
export const focusIdSchema = z
  .number()
  .int()
  .refine((id) => statements.some((s) => s.id === id), { error: "Choose one of the twelve statements" })
  .nullish();

/* ---------- Building blocks ---------- */

export function pointsFor(value: AnswerValue): number {
  const points = POINTS.get(value);
  if (points === undefined) throw new AssessmentAnswerError(`Unknown answer "${String(value)}".`);
  return points;
}

/** 0–1 strong, 2–3 watch, 4–6 leak. */
export function levelFor(score: number): PatternLevel {
  if (score <= 1) return "strong";
  if (score <= 3) return "watch";
  return "leak";
}

export function bandFor(total: number): Band {
  const band = bands.find((b) => total >= b.min && total <= b.max);
  if (!band) throw new RangeError(`No band covers a total of ${total}.`);
  return band;
}

/** round((24 − total) / 24 × 100) */
export function powerScoreFor(total: number): number {
  return Math.round(((MAX_TOTAL - total) / MAX_TOTAL) * 100);
}

export function isValidAnswer(value: unknown): value is AnswerValue {
  return typeof value === "string" && POINTS.has(value as AnswerValue);
}

/** True when every statement has a valid answer. */
export function isComplete(answers: Partial<Answers> | null | undefined): answers is Answers {
  if (!answers || typeof answers !== "object") return false;
  return statements.every((s) => isValidAnswer(answers[s.id]));
}

/** Throws AssessmentAnswerError naming the first missing or invalid answer. */
export function assertComplete(answers: unknown): asserts answers is Answers {
  if (!answers || typeof answers !== "object") {
    throw new AssessmentAnswerError("Answers are missing. Expected an answer for each of the 12 statements.");
  }
  const record = answers as Record<number, unknown>;
  for (const s of statements) {
    const value = record[s.id];
    if (value === undefined || value === null || value === "") {
      throw new AssessmentAnswerError(`Statement ${s.id} has no answer. Every statement needs Often, Sometimes or Rarely.`);
    }
    if (!isValidAnswer(value)) {
      throw new AssessmentAnswerError(
        `Statement ${s.id} has an invalid answer "${String(value)}". Use "often", "sometimes" or "rarely".`,
      );
    }
  }
}

/**
 * The statements offered on the power focus step: the ones marked Often, or
 * the ones marked Sometimes when nothing was marked Often. Works on partial answers.
 */
export function focusCandidateIds(answers: Partial<Answers>): number[] {
  const often = statements.filter((s) => answers[s.id] === "often").map((s) => s.id);
  if (often.length > 0) return often;
  return statements.filter((s) => answers[s.id] === "sometimes").map((s) => s.id);
}

/* ---------- The result ---------- */

export function computeResult(answers: Answers, focusId?: number | null): AssessmentResult {
  assertComplete(answers);

  const total = statements.reduce((sum, s) => sum + pointsFor(answers[s.id]), 0);

  const patternResults: PatternResult[] = patterns.map((pattern) => {
    const statementIds = statements.filter((s) => s.pattern === pattern.id).map((s) => s.id);
    const score = statementIds.reduce((sum, id) => sum + pointsFor(answers[id]), 0);
    return { pattern, score, level: levelFor(score), statementIds };
  });

  const oftenIds = statements.filter((s) => answers[s.id] === "often").map((s) => s.id);
  const sometimesIds = statements.filter((s) => answers[s.id] === "sometimes").map((s) => s.id);

  const topScore = Math.max(...patternResults.map((p) => p.score));
  const dominant =
    topScore <= 1
      ? []
      : patternResults
          .map((p, order) => ({
            pattern: p.pattern,
            score: p.score,
            order,
            often: p.statementIds.filter((id) => answers[id] === "often").length,
          }))
          .filter((p) => p.score === topScore)
          .sort((a, b) => b.often - a.often || a.order - b.order)
          .map((p) => p.pattern);

  const candidates = oftenIds.length > 0 ? oftenIds : sometimesIds;
  const focus =
    typeof focusId === "number" && candidates.includes(focusId)
      ? (statements.find((s) => s.id === focusId) ?? null)
      : null;

  let recommendedProgramSlug: string;
  if (total >= HIGH_LEAK_TOTAL) recommendedProgramSlug = HIGH_LEAK_PROGRAM;
  else if (dominant.length > 0) recommendedProgramSlug = dominant[0].program;
  else recommendedProgramSlug = DEFAULT_PROGRAM;

  return {
    total,
    powerScore: powerScoreFor(total),
    band: bandFor(total),
    patterns: patternResults,
    oftenIds,
    sometimesIds,
    dominant,
    focus,
    recommendedProgramSlug,
  };
}
