import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { patterns, statements, type AnswerValue } from "../../content/assessment";
import {
  AssessmentAnswerError,
  DEFAULT_PROGRAM,
  HIGH_LEAK_PROGRAM,
  MAX_TOTAL,
  answersSchema,
  bandFor,
  computeResult,
  focusCandidateIds,
  focusIdSchema,
  isComplete,
  levelFor,
  powerScoreFor,
  type Answers,
} from "./scoring";

/** Every statement answered "rarely", with overrides by statement id. */
function answersWith(overrides: Partial<Record<number, AnswerValue>> = {}): Answers {
  const out: Answers = {};
  for (const s of statements) out[s.id] = overrides[s.id] ?? "rarely";
  return out;
}

/** Answers that add up to exactly `total`, filling statements in order. */
function answersWithTotal(total: number): Answers {
  let remaining = total;
  const out: Answers = {};
  for (const s of statements) {
    if (remaining >= 2) {
      out[s.id] = "often";
      remaining -= 2;
    } else if (remaining === 1) {
      out[s.id] = "sometimes";
      remaining -= 1;
    } else {
      out[s.id] = "rarely";
    }
  }
  assert.equal(remaining, 0, `cannot build a total of ${total}`);
  return out;
}

const ids = (list: { id: string }[]) => list.map((p) => p.id);

describe("content assumptions", () => {
  it("has 12 statements in 4 patterns of 3, and a 0–24 scale", () => {
    assert.equal(statements.length, 12);
    assert.equal(patterns.length, 4);
    for (const p of patterns) assert.equal(statements.filter((s) => s.pattern === p.id).length, 3);
    assert.equal(MAX_TOTAL, 24);
  });
});

describe("bands", () => {
  const cases: [number, string][] = [
    [0, "holder"],
    [6, "holder"],
    [7, "rising"],
    [12, "rising"],
    [13, "leaking"],
    [18, "leaking"],
    [19, "ready"],
    [24, "ready"],
  ];
  for (const [total, band] of cases) {
    it(`total ${total} is "${band}"`, () => {
      assert.equal(bandFor(total).id, band);
      const result = computeResult(answersWithTotal(total));
      assert.equal(result.total, total);
      assert.equal(result.band.id, band);
    });
  }

  it("rejects totals outside 0–24", () => {
    assert.throws(() => bandFor(-1), RangeError);
    assert.throws(() => bandFor(25), RangeError);
  });
});

describe("power score", () => {
  const cases: [number, number][] = [
    [0, 100],
    [1, 96], // 95.83
    [3, 88], // 87.5 rounds up
    [5, 79], // 79.17
    [6, 75],
    [9, 63], // 62.5 rounds up
    [12, 50],
    [23, 4], // 4.17
    [24, 0],
  ];
  for (const [total, score] of cases) {
    it(`total ${total} → ${score}`, () => {
      assert.equal(powerScoreFor(total), score);
      assert.equal(computeResult(answersWithTotal(total)).powerScore, score);
    });
  }
});

describe("pattern levels", () => {
  it("0–1 strong, 2–3 watch, 4–6 leak", () => {
    assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(levelFor), ["strong", "strong", "watch", "watch", "leak", "leak", "leak"]);
  });

  it("scores each pattern from its own three statements, in content order", () => {
    const result = computeResult(
      answersWith({
        1: "sometimes", // readiness = 1
        4: "often", // what-if = 2
        7: "often",
        8: "sometimes", // self-last = 3
        10: "often",
        11: "often", // waiting = 4
      }),
    );
    assert.deepEqual(ids(result.patterns.map((p) => p.pattern)), ["readiness", "what-if", "self-last", "waiting"]);
    assert.deepEqual(
      result.patterns.map((p) => [p.score, p.level]),
      [
        [1, "strong"],
        [2, "watch"],
        [3, "watch"],
        [4, "leak"],
      ],
    );
    assert.deepEqual(result.patterns[0].statementIds, [1, 2, 3]);
    assert.deepEqual(result.patterns[3].statementIds, [10, 11, 12]);
    assert.equal(result.total, 10);
    assert.deepEqual(result.oftenIds, [4, 7, 10, 11]);
    assert.deepEqual(result.sometimesIds, [1, 8]);
  });

  it("all often scores 6 / leak everywhere", () => {
    const result = computeResult(answersWithTotal(24));
    assert.ok(result.patterns.every((p) => p.score === 6 && p.level === "leak"));
  });
});

describe("dominant pattern", () => {
  it("is the single highest-scoring pattern", () => {
    const result = computeResult(answersWith({ 1: "sometimes", 2: "sometimes", 3: "sometimes", 4: "often" }));
    // readiness 3 (no often) beats what-if 2 (one often): score comes first.
    assert.deepEqual(ids(result.dominant), ["readiness"]);
  });

  it("breaks a tie by the number of Often answers", () => {
    const result = computeResult(
      answersWith({
        1: "often",
        2: "sometimes",
        3: "sometimes", // readiness 4, one often
        4: "often",
        5: "often", // what-if 4, two often
      }),
    );
    assert.deepEqual(ids(result.dominant), ["what-if", "readiness"]);
  });

  it("then by content order", () => {
    const result = computeResult(answersWith({ 7: "often", 8: "often", 10: "often", 11: "often" }));
    assert.deepEqual(ids(result.dominant), ["self-last", "waiting"]);
  });

  it("includes only patterns at the top score", () => {
    const result = computeResult(answersWith({ 10: "often", 11: "often", 12: "often", 1: "often", 2: "often" }));
    assert.deepEqual(ids(result.dominant), ["waiting"]);
  });

  it("is empty when every pattern scores 1 or less", () => {
    const result = computeResult(answersWith({ 1: "sometimes", 4: "sometimes", 7: "sometimes", 10: "sometimes" }));
    assert.equal(result.total, 4);
    assert.deepEqual(result.dominant, []);
    assert.deepEqual(computeResult(answersWithTotal(0)).dominant, []);
  });
});

describe("power focus", () => {
  const answers = answersWith({ 2: "often", 6: "often", 9: "sometimes" });

  it("accepts a statement marked Often", () => {
    assert.equal(computeResult(answers, 6).focus?.id, 6);
    assert.equal(computeResult(answers, 2).focus?.text, statements[1].text);
  });

  it("rejects a Sometimes statement when something was marked Often", () => {
    assert.equal(computeResult(answers, 9).focus, null);
  });

  it("accepts a Sometimes statement when nothing was marked Often", () => {
    const noOften = answersWith({ 3: "sometimes", 12: "sometimes" });
    assert.equal(computeResult(noOften, 12).focus?.id, 12);
    assert.equal(computeResult(noOften, 1).focus, null); // rated rarely
  });

  it("is null for Rarely, unknown, missing or non-integer ids", () => {
    assert.equal(computeResult(answers, 1).focus, null);
    assert.equal(computeResult(answers, 99).focus, null);
    assert.equal(computeResult(answers).focus, null);
    assert.equal(computeResult(answers, null).focus, null);
    assert.equal(computeResult(answers, 2.5).focus, null);
    assert.equal(computeResult(answersWithTotal(0), 1).focus, null);
  });

  it("offers Often statements first, then Sometimes, else nothing", () => {
    assert.deepEqual(focusCandidateIds(answers), [2, 6]);
    assert.deepEqual(focusCandidateIds(answersWith({ 3: "sometimes", 12: "sometimes" })), [3, 12]);
    assert.deepEqual(focusCandidateIds(answersWithTotal(0)), []);
    assert.deepEqual(focusCandidateIds({ 5: "often" }), [5]); // partial answers are fine here
  });
});

describe("answer validation", () => {
  it("throws when an answer is missing", () => {
    const answers: Partial<Answers> = answersWith();
    delete answers[5];
    assert.throws(() => computeResult(answers as Answers), (err: unknown) => {
      assert.ok(err instanceof AssessmentAnswerError);
      assert.match(err.message, /Statement 5 has no answer/);
      return true;
    });
  });

  it("throws when an answer is invalid", () => {
    const answers = { ...answersWith(), 7: "always" } as unknown as Answers;
    assert.throws(() => computeResult(answers), /Statement 7 has an invalid answer "always"/);
  });

  it("throws when answers are not an object", () => {
    assert.throws(() => computeResult(null as unknown as Answers), AssessmentAnswerError);
    assert.throws(() => computeResult({} as Answers), /Statement 1 has no answer/);
  });

  it("isComplete reports partial answers", () => {
    assert.equal(isComplete(answersWith()), true);
    assert.equal(isComplete({ 1: "often" }), false);
    assert.equal(isComplete(null), false);
  });
});

describe("recommended program", () => {
  it("recommends the dominant pattern's program below 13", () => {
    // readiness 4 → workshop
    assert.equal(computeResult(answersWith({ 1: "often", 2: "often" })).recommendedProgramSlug, patterns[0].program);
    // what-if 6 → 1:1 coaching
    assert.equal(
      computeResult(answersWith({ 4: "often", 5: "often", 6: "often" })).recommendedProgramSlug,
      "one-to-one-coaching",
    );
    // self-last 6 ties waiting 6 at total 12 → self-last wins on order → masterclass
    const tie = computeResult(answersWith({ 7: "often", 8: "often", 9: "often", 10: "often", 11: "often", 12: "often" }));
    assert.equal(tie.total, 12);
    assert.equal(tie.recommendedProgramSlug, "be-heard-masterclass");
    // waiting 6 + readiness 1 → mindset mastery
    assert.equal(
      computeResult(answersWith({ 10: "often", 11: "often", 12: "often", 1: "sometimes" })).recommendedProgramSlug,
      "mindset-mastery",
    );
  });

  it("recommends 1:1 coaching from a total of 13", () => {
    const answers = answersWith({ 7: "often", 8: "often", 9: "often", 10: "often", 11: "often", 12: "often", 1: "sometimes" });
    const result = computeResult(answers);
    assert.equal(result.total, 13);
    assert.equal(result.dominant[0].id, "self-last");
    assert.equal(result.recommendedProgramSlug, HIGH_LEAK_PROGRAM);
    assert.equal(computeResult(answersWithTotal(24)).recommendedProgramSlug, HIGH_LEAK_PROGRAM);
  });

  it("recommends the leadership workshop when nothing stands out", () => {
    assert.equal(computeResult(answersWithTotal(0)).recommendedProgramSlug, DEFAULT_PROGRAM);
    assert.equal(DEFAULT_PROGRAM, "leadership-confidence-workshop");
  });
});

describe("answersSchema", () => {
  const raw = Object.fromEntries(statements.map((s) => [String(s.id), "sometimes"]));

  it("parses twelve string-keyed answers into numeric keys", () => {
    const parsed = answersSchema.parse(raw);
    assert.equal(parsed[1], "sometimes");
    assert.equal(computeResult(parsed).total, 12);
  });

  it("rejects missing, invalid and unknown answers", () => {
    const missing = { ...raw };
    delete missing["12"];
    assert.equal(answersSchema.safeParse(missing).success, false);
    assert.equal(answersSchema.safeParse({ ...raw, "3": "never" }).success, false);
    assert.equal(answersSchema.safeParse({ ...raw, "13": "often" }).success, false);
    assert.equal(answersSchema.safeParse("often").success, false);
  });

  it("focusIdSchema accepts known ids or nothing", () => {
    assert.equal(focusIdSchema.safeParse(4).success, true);
    assert.equal(focusIdSchema.safeParse(null).success, true);
    assert.equal(focusIdSchema.safeParse(undefined).success, true);
    assert.equal(focusIdSchema.safeParse(13).success, false);
    assert.equal(focusIdSchema.safeParse("4").success, false);
  });
});
