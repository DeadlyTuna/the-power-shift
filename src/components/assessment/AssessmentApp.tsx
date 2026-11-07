"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion } from "framer-motion";
import { statements, type AnswerValue } from "@/content/assessment";
import { track } from "@/lib/analytics";
import { computeResult, focusCandidateIds, isComplete, type Answers } from "@/lib/assessment/scoring";
import {
  clearProgress,
  parseProgress,
  readRawProgress,
  saveProgress,
  subscribeToProgress,
  type AssessmentStage,
  type SavedProgress,
} from "@/lib/assessment/storage";
import { AssessmentIntro } from "./AssessmentIntro";
import { AssessmentResults } from "./AssessmentResults";
import { FocusStep } from "./FocusStep";
import { QuestionStep } from "./QuestionStep";

/**
 * The Power Self-Assessment as a client-side state machine:
 *   intro → questions (12) → focus → results
 *
 * Nothing lives in the URL. Progress is kept in localStorage so a visitor
 * can leave and continue later; answers only leave the browser if the person
 * emails their results.
 */

const ADVANCE_DELAY_MS = 350;
const LAST = statements.length - 1;

export function AssessmentApp() {
  const [stage, setStage] = useState<AssessmentStage>("intro");
  const [index, setIndex] = useState(0);
  /** 1 when moving forward, -1 when going back: steps slide in from that side. */
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [focusId, setFocusId] = useState<number | null>(null);

  // Saved progress is read after hydration (the server snapshot is always "nothing saved").
  const rawSaved = useSyncExternalStore(subscribeToProgress, readRawProgress, () => null);
  const saved = useMemo(() => parseProgress(rawSaved), [rawSaved]);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);
  const previousStage = useRef<AssessmentStage>("intro");
  const advanceTimer = useRef<number | null>(null);
  const completionTracked = useRef(false);

  // Keep progress in this browser as the person goes.
  useEffect(() => {
    if (stage === "intro") return;
    saveProgress({ stage, index, answers, focusId });
  }, [stage, index, answers, focusId]);

  // Move focus to the new screen's heading so screen readers announce it.
  useEffect(() => {
    if (!interacted.current) return;
    const heading = headingRef.current;
    if (previousStage.current !== stage) {
      previousStage.current = stage;
      window.scrollTo({ top: 0 });
      heading?.focus({ preventScroll: true });
    } else {
      heading?.focus();
    }
  }, [stage, index]);

  useEffect(
    () => () => {
      if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  const result = useMemo(
    () => (stage === "results" && isComplete(answers) ? computeResult(answers, focusId) : null),
    [stage, answers, focusId],
  );

  function cancelAdvance() {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }

  function showResults(final: Answers, chosenFocus: number | null) {
    setFocusId(chosenFocus);
    setStage("results");
    if (!completionTracked.current) {
      completionTracked.current = true;
      track("AssessmentCompleted", { band: computeResult(final, chosenFocus).band.id });
    }
  }

  function finishQuestions(current: Partial<Answers>) {
    const missing = statements.findIndex((s) => current[s.id] === undefined);
    if (missing !== -1 || !isComplete(current)) {
      setIndex(missing === -1 ? 0 : missing);
      return;
    }
    const candidates = focusCandidateIds(current);
    if (candidates.length === 0) {
      showResults(current, null);
      return;
    }
    // Keep an earlier choice if it's still valid; preselect when there is only one.
    const keep = focusId !== null && candidates.includes(focusId) ? focusId : candidates.length === 1 ? candidates[0] : null;
    setFocusId(keep);
    setStage("focus");
  }

  function advanceFrom(from: number, current: Partial<Answers>) {
    if (from < LAST) setIndex(from + 1);
    else finishQuestions(current);
  }

  function start() {
    interacted.current = true;
    cancelAdvance();
    clearProgress();
    completionTracked.current = false;
    setAnswers({});
    setFocusId(null);
    setIndex(0);
    setStage("questions");
    track("AssessmentStarted");
  }

  function resume(progress: SavedProgress) {
    interacted.current = true;
    cancelAdvance();
    setAnswers(progress.answers);
    setFocusId(progress.focusId);
    const complete = isComplete(progress.answers);
    if (complete && progress.stage === "results") {
      completionTracked.current = true;
      setStage("results");
    } else if (complete && progress.stage === "focus") {
      if (focusCandidateIds(progress.answers).length === 0) {
        completionTracked.current = true;
        setStage("results");
      } else {
        setStage("focus");
      }
    } else {
      const firstMissing = statements.findIndex((s) => progress.answers[s.id] === undefined);
      setIndex(progress.stage === "questions" ? progress.index : firstMissing === -1 ? LAST : firstMissing);
      setStage("questions");
    }
  }

  function choose(value: AnswerValue) {
    setDirection(1);
    const id = statements[index].id;
    const next = { ...answers, [id]: value };
    setAnswers(next);
    cancelAdvance();
    const from = index;
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      advanceFrom(from, next);
    }, ADVANCE_DELAY_MS);
  }

  function back() {
    cancelAdvance();
    setDirection(-1);
    if (stage === "focus") {
      setIndex(LAST);
      setStage("questions");
    } else if (index > 0) {
      setIndex(index - 1);
    } else {
      setStage("intro");
    }
  }

  function clearAll() {
    cancelAdvance();
    clearProgress();
    completionTracked.current = false;
    setAnswers({});
    setFocusId(null);
    setIndex(0);
    setStage("intro");
  }

  let content: ReactNode;
  if (stage === "questions") {
    const statement = statements[index];
    content = (
      <QuestionStep
        index={index}
        statement={statement}
        value={answers[statement.id]}
        onChoose={choose}
        onBack={back}
        onNext={() => {
          cancelAdvance();
          setDirection(1);
          advanceFrom(index, answers);
        }}
        headingRef={headingRef}
      />
    );
  } else if (stage === "focus" && isComplete(answers)) {
    const candidateIds = focusCandidateIds(answers);
    content = (
      <FocusStep
        candidates={statements.filter((s) => candidateIds.includes(s.id))}
        basis={statements.some((s) => answers[s.id] === "often") ? "often" : "sometimes"}
        value={focusId}
        onChange={setFocusId}
        onSubmit={(chosen) => showResults(answers, chosen)}
        onSkip={() => showResults(answers, null)}
        onBack={back}
        headingRef={headingRef}
      />
    );
  } else if (stage === "results" && result && isComplete(answers)) {
    content = (
      <AssessmentResults
        result={result}
        answers={answers}
        focusId={focusId}
        canChooseFocus={focusCandidateIds(answers).length > 0}
        onChangeFocus={() => setStage("focus")}
        onRetake={start}
        onClear={clearAll}
        headingRef={headingRef}
      />
    );
  } else {
    content = <AssessmentIntro saved={saved} onStart={start} onResume={resume} headingRef={headingRef} />;
  }

  // Each step slides in from the side you're moving towards. Only the entrance is animated, so the
  // new step mounts at once and focus moves to its heading without waiting for an exit animation.
  return (
    <motion.div
      key={stage === "questions" ? `q-${index}` : stage}
      initial={{ opacity: 0, x: stage === "questions" ? direction * 28 : 0, y: stage === "questions" ? 0 : 16 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  );
}
