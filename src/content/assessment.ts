/**
 * MY POWER SELF-ASSESSMENT — © Manisha Agrawal.
 *
 * Twelve statements, each answered Often / Sometimes / Rarely.
 * Every three statements describe one "power leak" pattern. Each statement
 * also carries a short limiting `script` and the `shift` (reframe) used by
 * the site's signature reframe component.
 *
 * Scoring: Often = 2, Sometimes = 1, Rarely = 0.
 * A pattern scores 0–6; the total scores 0–24 (higher = more power leaking).
 */

export type AnswerValue = "often" | "sometimes" | "rarely";

export const answerOptions: { value: AnswerValue; label: string; points: number }[] = [
  { value: "often", label: "Often", points: 2 },
  { value: "sometimes", label: "Sometimes", points: 1 },
  { value: "rarely", label: "Rarely", points: 0 },
];

export type PatternId = "readiness" | "what-if" | "self-last" | "waiting";

export type Pattern = {
  id: PatternId;
  name: string;
  /** The power this pattern drains, and that the client reclaims. */
  power: string;
  looksLike: string;
  cost: string;
  /** A small practice the reader can try in the next 24 hours. */
  practice: string;
  /** Program slug recommended when this is the strongest pattern. */
  program: string;
};

export const patterns: Pattern[] = [
  {
    id: "readiness",
    name: "The Readiness Trap",
    power: "The power to begin",
    looksLike:
      "You wait to feel completely ready, treat mistakes as verdicts on who you are, and let fear or overthinking hold back the first step.",
    cost: "Good ideas stay ideas, and opportunities pass while you are still preparing.",
    practice:
      "Pick one step you have been postponing and shrink it until it takes ten minutes. Do it within the next 24 hours, before you feel ready.",
    program: "leadership-confidence-workshop",
  },
  {
    id: "what-if",
    name: "The What-If Loop",
    power: "The power of focus",
    looksLike:
      "Your mind rehearses everything that could go wrong, spends energy on things you can't control, and lets other people's moods decide how peaceful you feel.",
    cost: "Decisions stall, and your energy drains into things you cannot change.",
    practice:
      "Draw two circles: what you can control, and what you can't. Before you react to something today, decide which circle it belongs in.",
    program: "one-to-one-coaching",
  },
  {
    id: "self-last",
    name: "The Self-Last Habit",
    power: "The power of boundaries",
    looksLike:
      "You say yes when you mean no, keep your own needs and dreams for later, and feel emotions so strongly that they end up running the conversation.",
    cost: "Resentment builds quietly, and the people around you never learn what you actually need.",
    practice:
      "The next time you want to say no, say \"Let me check and get back to you.\" Use the pause to decide what you really want, then answer.",
    program: "be-heard-masterclass",
  },
  {
    id: "waiting",
    name: "The Waiting Game",
    power: "The power of ownership",
    looksLike:
      "You wait for people or situations to change, postpone the things you know need your action, and go with the flow instead of steering.",
    cost: "Life happens to you instead of being shaped by you.",
    practice:
      "Name one situation you have been waiting on. Write down the one action that is yours to take, and put a date next to it.",
    program: "mindset-mastery",
  },
];

export type Statement = {
  id: number;
  text: string;
  pattern: PatternId;
  /** The limiting script in the reader's own voice. */
  script: string;
  /** The reframe that replaces it. */
  shift: string;
};

export const statements: Statement[] = [
  {
    id: 1,
    text: "I want to feel completely ready before taking an important step.",
    pattern: "readiness",
    script: "I'll start when I feel ready.",
    shift: "I start, and readiness follows.",
  },
  {
    id: 2,
    text: "When I make a mistake, I feel like a failure.",
    pattern: "readiness",
    script: "I made a mistake, so I'm a failure.",
    shift: "A mistake is something I did, not who I am.",
  },
  {
    id: 3,
    text: "I know what I want to do, but fear, doubt or overthinking stops me from taking the first step.",
    pattern: "readiness",
    script: "I'm too unsure to take the first step.",
    shift: "I can feel the fear and take the step anyway.",
  },
  {
    id: 4,
    text: "I keep thinking 'what if something goes wrong…' scenarios that keep me stuck in indecision.",
    pattern: "what-if",
    script: "What if it all goes wrong?",
    shift: "What if it goes right? I'll handle what comes.",
  },
  {
    id: 5,
    text: "I spend a lot of emotional energy thinking about things or people beyond my control.",
    pattern: "what-if",
    script: "I can't stop worrying about what I can't control.",
    shift: "My energy goes where my power is.",
  },
  {
    id: 6,
    text: "My peace is easily affected by how other people behave, respond to me or think about me.",
    pattern: "what-if",
    script: "My peace depends on what they think.",
    shift: "My peace is mine to keep.",
  },
  {
    id: 7,
    text: "I sometimes say YES when I really want to say NO because I don't want to disappoint people.",
    pattern: "self-last",
    script: "I'll say yes so no one is disappointed.",
    shift: "A clear no is a kind no.",
  },
  {
    id: 8,
    text: "I put my own needs, growth or dreams aside because my family's needs always seem more important.",
    pattern: "self-last",
    script: "My dreams can wait. Everyone else comes first.",
    shift: "Caring for myself is part of caring for them.",
  },
  {
    id: 9,
    text: "I am very emotional and oversensitive.",
    pattern: "self-last",
    script: "I'm too emotional.",
    shift: "I feel deeply, and I choose how I respond.",
  },
  {
    id: 10,
    text: "When something isn't working in my life, I wait for the situation or person to change.",
    pattern: "waiting",
    script: "Things will get better when they change.",
    shift: "I change what I can, starting with my next move.",
  },
  {
    id: 11,
    text: "I know there are areas of my life where I need to take more responsibility or action, but I keep postponing it.",
    pattern: "waiting",
    script: "I'll deal with it later.",
    shift: "Small action today beats a perfect plan someday.",
  },
  {
    id: 12,
    text: "There are parts of my life where I tend to go with the flow rather than consciously steering my own ship.",
    pattern: "waiting",
    script: "I'll just go with the flow.",
    shift: "I steer my own ship.",
  },
];

export type Band = {
  id: "holder" | "rising" | "leaking" | "ready";
  /** Inclusive range of the total leak score (0–24). */
  min: number;
  max: number;
  title: string;
  summary: string;
};

export const bands: Band[] = [
  {
    id: "holder",
    min: 0,
    max: 6,
    title: "Power Holder",
    summary:
      "You mostly act from choice, not fear. Your work now is staying consistent under pressure, and helping the people around you find their power too.",
  },
  {
    id: "rising",
    min: 7,
    max: 12,
    title: "Power Rising",
    summary:
      "You know your patterns and often catch them in time. A few habits still leak your power, mostly in the areas highlighted below.",
  },
  {
    id: "leaking",
    min: 13,
    max: 18,
    title: "Power Leaking",
    summary:
      "Some patterns are costing you real energy, confidence and opportunities. The good news: patterns are learned, so they can be unlearned.",
  },
  {
    id: "ready",
    min: 19,
    max: 24,
    title: "Ready for the Shift",
    summary:
      "Right now much of your power is going to fear, other people and waiting. That is not a verdict. It's a starting point, and you have just taken the first step by noticing.",
  },
];

export const assessmentCopy = {
  title: "My Power Self-Assessment",
  intro: "There are no right answers. Notice your patterns without judging them.",
  focusPrompt: "Look at the statements you marked Often. Choose the one that is costing you the most today.",
  disclaimer:
    "This is a self-reflection tool designed by Manisha Agrawal for coaching conversations. It is not a psychological or medical assessment.",
  copyright: "© Manisha Agrawal · Leadership Coach",
  minutes: 3,
};
