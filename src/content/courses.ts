import type { CourseModule, Program } from "./programs";

/**
 * MOCK self-paced courses for demonstrating the course catalog, enrollment,
 * student accounts and the course player. Titles, curricula, durations and
 * prices are placeholders shaped around Manisha's real themes (and the four
 * Power Self-Assessment patterns). Replace them with the real catalogue, or
 * delete this file's entries, before launch. While `mock: true` and Razorpay
 * isn't configured, checkout runs in demo mode and no money is taken.
 */

type LessonSpec = [title: string, minutes: number, preview?: boolean];

/** Build a module with stable lesson ids like "scwc-m2-l3". */
function mod(code: string, index: number, title: string, lessons: LessonSpec[]): CourseModule {
  return {
    title,
    lessons: lessons.map(([lessonTitle, minutes, preview], i) => ({
      id: `${code}-m${index}-l${i + 1}`,
      title: lessonTitle,
      minutes,
      ...(preview ? { preview: true } : {}),
    })),
  };
}

const courseFaqs = [
  {
    q: "How long do I have access?",
    a: "Lifetime access. Watch at your own pace, on any device, and come back to the lessons whenever you need them.",
  },
  {
    q: "Is this live or recorded?",
    a: "Recorded. Every lesson is a short video with a practical exercise, so you can fit it around work and home.",
  },
  {
    q: "Can I get help if I'm stuck?",
    a: "Yes. Message the team on WhatsApp, or book a clarity call with Manisha if you'd like one-to-one support.",
  },
];

const selfPacedFormat = [
  { label: "Format", value: "Self-paced video course" },
  { label: "Language", value: "English" },
  { label: "Access", value: "Lifetime" },
];

export const courses: Program[] = [
  {
    slug: "speak-up-with-confidence",
    mode: "paid",
    mock: true,
    title: "Speak Up with Confidence",
    shortTitle: "Speak Up with Confidence",
    audience: "For professionals who go quiet in meetings",
    promise: "Say what you think in meetings, clearly and calmly, without rehearsing it ten times first.",
    summary:
      "A practical course for capable professionals who hold back in meetings. Understand the silent script behind hesitation, learn to make one clear point under pressure, and build the calm authority that gets you taken seriously.",
    outcomes: [
      "Spot the script that keeps you quiet, and interrupt it",
      "Structure a clear answer in under 30 seconds",
      "Disagree respectfully without apologising",
      "Handle interruptions with calm authority",
    ],
    format: selfPacedFormat,
    price: { amount: 2499 },
    faqs: courseFaqs,
    addresses: ["readiness", "what-if"],
    course: {
      category: "Confidence",
      level: "All levels",
      accent: "marigold",
      includes: ["Downloadable worksheets", "A 21-day speaking-up plan", "Lifetime access", "Certificate of completion"],
      modules: [
        mod("suc", 1, "Why capable people go quiet", [
          ["The silent script behind hesitation", 9, true],
          ["Perfectionism, approval and the fear of being wrong", 12],
          ["Your speaking-up baseline", 7],
        ]),
        mod("suc", 2, "Clarity before confidence", [
          ["The one-sentence point", 10],
          ["Structuring an answer in 30 seconds", 14],
          ["Practice: three meetings, three points", 8],
        ]),
        mod("suc", 3, "Calm authority", [
          ["Voice, pace and the power of the pause", 11],
          ["Handling interruptions", 9],
          ["Disagreeing without apologising", 13],
        ]),
        mod("suc", 4, "Making it stick", [
          ["Your 21-day speaking-up plan", 8],
          ["Reflection and next steps", 6],
        ]),
      ],
    },
  },
  {
    slug: "decide-without-overthinking",
    mode: "paid",
    mock: true,
    title: "Decide Without Overthinking",
    shortTitle: "Decide Without Overthinking",
    audience: "For anyone stuck in the what-if loop",
    promise: "Make decisions with the clarity you have, and stop replaying them afterwards.",
    summary:
      "Break the what-if loop. Learn to separate what you can control from what you can't, use simple decision tools when the answer isn't obvious, and act on a choice without second-guessing it all night.",
    outcomes: [
      "Recognise when overthinking has stopped being useful",
      "Sort concerns into what you can and can't control",
      "Use three simple tools for decisions under uncertainty",
      "Commit to a decision and stop replaying it",
    ],
    format: selfPacedFormat,
    price: { amount: 1999 },
    faqs: courseFaqs,
    addresses: ["what-if", "readiness"],
    course: {
      category: "Mindset",
      level: "Beginner",
      accent: "peacock",
      includes: ["Decision worksheets", "Circle-of-control exercise", "Lifetime access", "Certificate of completion"],
      modules: [
        mod("dwo", 1, "How the what-if loop works", [
          ["Why your mind rehearses the worst case", 8, true],
          ["The real cost of indecision", 10],
        ]),
        mod("dwo", 2, "Control and concern", [
          ["Drawing your two circles", 9],
          ["Letting go of what isn't yours to carry", 12],
          ["When other people's opinions take over", 11],
        ]),
        mod("dwo", 3, "Deciding under uncertainty", [
          ["Good-enough information", 10],
          ["The 10-10-10 check", 8],
          ["Deciding with your values", 12],
        ]),
        mod("dwo", 4, "From decision to action", [
          ["The first ten-minute step", 7],
          ["Stopping the replay", 9],
        ]),
      ],
    },
  },
  {
    slug: "boundaries-without-guilt",
    mode: "paid",
    mock: true,
    title: "Boundaries Without Guilt",
    shortTitle: "Boundaries Without Guilt",
    audience: "For working women who always adjust",
    promise: "Say no kindly, ask for what you need, and stop putting yourself last.",
    summary:
      "For women who manage everything at work and at home and still feel unheard. Learn why saying yes feels safer than saying no, how to express what you need without guilt or conflict, and how to protect your energy day to day.",
    outcomes: [
      "Understand where the urge to always adjust comes from",
      "Say a clear, kind no without over-explaining",
      "Express your needs without guilt or a fight",
      "Build daily habits that protect your energy",
    ],
    format: [
      { label: "Format", value: "Self-paced video course" },
      { label: "Language", value: "Hindi / English" },
      { label: "Access", value: "Lifetime" },
    ],
    price: { amount: 1999 },
    faqs: courseFaqs,
    addresses: ["self-last"],
    course: {
      category: "Relationships",
      level: "All levels",
      accent: "kumkum",
      includes: ["Scripts for difficult conversations", "Energy audit worksheet", "Lifetime access", "Certificate of completion"],
      modules: [
        mod("bwg", 1, "Why you always adjust", [
          ["The self-last habit", 9, true],
          ["Guilt, love and the fear of disappointing people", 13],
        ]),
        mod("bwg", 2, "A clear no is a kind no", [
          ["The pause before yes", 8],
          ["Saying no without over-explaining", 11],
          ["When they push back", 10],
        ]),
        mod("bwg", 3, "Being heard", [
          ["Expressing a need, not a complaint", 12],
          ["Conversations that create connection", 14],
        ]),
        mod("bwg", 4, "Protecting your energy", [
          ["Your energy audit", 9],
          ["Making space for your own growth", 10],
        ]),
      ],
    },
  },
  {
    slug: "30-day-power-shift-challenge",
    mode: "paid",
    mock: true,
    title: "The 30-Day Power Shift Challenge",
    shortTitle: "30-Day Power Shift Challenge",
    audience: "For anyone ready to start small",
    promise: "One short prompt a day to notice your scripts, strike them through, and write your shift.",
    summary:
      "A month of small daily practices built on the Power Self-Assessment. Each day takes about ten minutes: a short video, a reflection prompt and one action. By the end you'll have rewritten the scripts that cost you the most.",
    outcomes: [
      "Name the scripts that drain your power",
      "Practise one small shift every day",
      "Build a habit of acting before you feel ready",
      "Finish with your own written power focus",
    ],
    format: [
      { label: "Format", value: "Daily prompts + short videos" },
      { label: "Language", value: "English" },
      { label: "Access", value: "Lifetime" },
    ],
    price: { amount: 999 },
    faqs: courseFaqs,
    addresses: ["readiness", "what-if", "self-last", "waiting"],
    course: {
      category: "Mindset",
      level: "Beginner",
      accent: "jamun",
      includes: ["30 daily prompts", "Printable challenge tracker", "Lifetime access", "Certificate of completion"],
      modules: [
        mod("pdc", 1, "Week 1 · Notice your scripts", [
          ["Day 1: Take the Power Self-Assessment", 6, true],
          ["Days 2–4: Catch the script in the moment", 12],
          ["Days 5–7: Where your power leaks", 11],
        ]),
        mod("pdc", 2, "Week 2 · Strike them through", [
          ["Days 8–10: Is this script true?", 10],
          ["Days 11–14: What it's costing you", 12],
        ]),
        mod("pdc", 3, "Week 3 · Write your shift", [
          ["Days 15–18: Writing a believable reframe", 11],
          ["Days 19–21: Rehearsing the new script", 10],
        ]),
        mod("pdc", 4, "Week 4 · Live it", [
          ["Days 22–26: One brave action a day", 13],
          ["Days 27–30: Your power focus going forward", 9],
        ]),
      ],
    },
  },
  {
    slug: "executive-presence-essentials",
    mode: "paid",
    mock: true,
    title: "Executive Presence Essentials",
    shortTitle: "Executive Presence Essentials",
    audience: "For managers stepping into bigger rooms",
    promise: "Be seen as a leader: composed under pressure, clear in the boardroom, trusted with the big calls.",
    summary:
      "What executive presence actually is, and how to build it without changing your personality. Learn the micro-habits of calm authority, how to communicate upwards with clarity, and how to stay composed when the stakes are high.",
    outcomes: [
      "Understand the three parts of executive presence",
      "Communicate upwards with clarity and brevity",
      "Stay composed in high-pressure conversations",
      "Build the micro-habits people read as leadership",
    ],
    format: selfPacedFormat,
    price: { amount: 3499 },
    faqs: courseFaqs,
    addresses: ["readiness", "waiting"],
    course: {
      category: "Leadership",
      level: "Intermediate",
      accent: "jamun",
      includes: ["Executive update templates", "Presence self-review", "Lifetime access", "Certificate of completion"],
      modules: [
        mod("epe", 1, "What presence really is", [
          ["Presence is not volume", 10, true],
          ["Gravitas, communication, composure", 13],
        ]),
        mod("epe", 2, "Clarity upwards", [
          ["The executive update", 12],
          ["Answer first, detail second", 9],
          ["Asking for what your team needs", 11],
        ]),
        mod("epe", 3, "Composure under pressure", [
          ["Responding instead of reacting", 12],
          ["Reading the emotions of the room", 10],
        ]),
        mod("epe", 4, "Micro-habits of authority", [
          ["How you enter, pause and close", 9],
          ["Your 30-day presence plan", 8],
        ]),
      ],
    },
  },
  {
    slug: "emotional-intelligence-at-work",
    mode: "paid",
    mock: true,
    title: "Emotional Intelligence at Work",
    shortTitle: "Emotional Intelligence at Work",
    audience: "For team leads and people managers",
    promise: "Handle your own emotions and your team's with empathy, especially when the pressure is on.",
    summary:
      "It's natural to be emotional at work, and it's okay to be human. Learn to notice what you feel before it runs the conversation, respond rather than react, and lead difficult conversations with empathy and clarity.",
    outcomes: [
      "Notice and name emotions before they take over",
      "Respond instead of reacting under pressure",
      "Lead difficult conversations with empathy",
      "Build a team culture where people feel heard",
    ],
    format: selfPacedFormat,
    price: { amount: 2999 },
    faqs: courseFaqs,
    addresses: ["self-last", "what-if"],
    course: {
      category: "Leadership",
      level: "All levels",
      accent: "peacock",
      includes: ["Conversation planning guide", "Team check-in templates", "Lifetime access", "Certificate of completion"],
      modules: [
        mod("eiw", 1, "It's okay to be human", [
          ["Emotions are information", 9, true],
          ["Where we park them, and where they leak", 11],
        ]),
        mod("eiw", 2, "Self-awareness and regulation", [
          ["Naming what you feel", 8],
          ["The pause between trigger and response", 12],
        ]),
        mod("eiw", 3, "Empathy in practice", [
          ["Listening so people feel heard", 11],
          ["Difficult conversations, step by step", 14],
          ["Feedback that lands", 10],
        ]),
        mod("eiw", 4, "Leading the room", [
          ["Reading the team's emotional temperature", 9],
          ["Building a culture of being heard", 10],
        ]),
      ],
    },
  },
];

export function isCourse(program: Program): boolean {
  return Boolean(program.course);
}

export function getCourse(slug: string): Program | undefined {
  return courses.find((c) => c.slug === slug);
}

/** All lessons of a course, in order. */
export function courseLessons(program: Program) {
  return program.course?.modules.flatMap((m) => m.lessons) ?? [];
}

/** Total video minutes. */
export function courseMinutes(program: Program): number {
  return courseLessons(program).reduce((sum, l) => sum + l.minutes, 0);
}

/** "2h 05m" or "45m". */
export function formatCourseLength(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export const courseCategories = ["Leadership", "Confidence", "Mindset", "Relationships"] as const;
