import { statements, type AnswerValue } from "../../content/assessment";
import { isValidAnswer } from "./scoring";

/**
 * Progress for the assessment, kept only in this browser (localStorage).
 * Nothing here is sent anywhere unless the person chooses to email their
 * results. Every access is wrapped in try/catch: storage can be blocked
 * (private mode, strict settings) and the quiz must still work without it.
 */

export type AssessmentStage = "intro" | "questions" | "focus" | "results";

export type SavedProgress = {
  stage: Exclude<AssessmentStage, "intro">;
  /** Index into `statements` of the statement on screen. */
  index: number;
  answers: Partial<Record<number, AnswerValue>>;
  focusId: number | null;
};

export const STORAGE_KEY = "tps:assessment:v1";

const STAGES = new Set(["questions", "focus", "results"]);

/** Raw stored string, for useSyncExternalStore (strings compare by value, so the snapshot is stable). */
export function readRawProgress(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Parse and sanitise stored progress; anything unexpected is dropped. */
export function parseProgress(raw: string | null): SavedProgress | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<SavedProgress> | null;
    if (!data || typeof data !== "object") return null;

    const answers: Partial<Record<number, AnswerValue>> = {};
    const source = (data.answers ?? {}) as Record<string, unknown>;
    for (const s of statements) {
      const value = source[String(s.id)];
      if (isValidAnswer(value)) answers[s.id] = value;
    }

    const stage = typeof data.stage === "string" && STAGES.has(data.stage) ? data.stage : "questions";
    const index =
      typeof data.index === "number" && Number.isInteger(data.index)
        ? Math.min(Math.max(data.index, 0), statements.length - 1)
        : 0;
    const focusId =
      typeof data.focusId === "number" && statements.some((s) => s.id === data.focusId) ? data.focusId : null;

    return { stage, index, answers, focusId };
  } catch {
    return null;
  }
}

export function saveProgress(progress: SavedProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage unavailable: progress simply isn't kept between visits.
  }
}

export function clearProgress(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

export function subscribeToProgress(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function answeredCount(answers: Partial<Record<number, AnswerValue>>): number {
  return statements.filter((s) => answers[s.id] !== undefined).length;
}
