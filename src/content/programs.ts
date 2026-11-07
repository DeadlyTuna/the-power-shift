import type { PatternId } from "./assessment";
import { courses } from "./courses";

/**
 * Programs and events people can enroll in.
 *
 * Enrollment modes:
 * - "free":        live event, registration form only
 * - "paid":        live event, registration + payment (Razorpay; falls back to `paymentLink`)
 * - "application": ongoing program, apply and get a discovery call
 * - "enquiry":     corporate / B2B, enquiry form
 *
 * Event dates are ISO strings in IST. When an event's start time has passed,
 * the site automatically switches it to "waitlist" mode until a new date is set.
 * Never set `seatsTaken` to anything but the real registration count.
 *
 * Self-paced courses (src/content/courses.ts) are paid programs with a
 * `course` field and no event; they're merged into `programs` below.
 *
 * MOCK DATA: entries with `mock: true` carry placeholder dates, prices or
 * curricula for demos. While Razorpay isn't configured, paying for a mock
 * program runs a demo checkout (nothing is charged) instead of using the real
 * hosted payment link. Remove `mock` once real details are in place.
 */

export type EnrollMode = "free" | "paid" | "application" | "enquiry";

export type ProgramEvent = {
  /** ISO 8601 with offset, e.g. "2026-05-22T18:00:00+05:30" */
  startsAt: string;
  durationMinutes: number;
  platform: string;
  language: string;
  capacity?: number;
  /** Real number of confirmed registrations. Leave undefined to hide the seat counter. */
  seatsTaken?: number;
  recordingAvailable: boolean;
};

export type CourseLesson = {
  /** Stable id used for progress tracking, e.g. "suc-m2-l3". */
  id: string;
  title: string;
  minutes: number;
  /** Free preview lesson, viewable before enrolling. */
  preview?: boolean;
};

export type CourseModule = { title: string; lessons: CourseLesson[] };

export type CourseDetails = {
  category: "Leadership" | "Confidence" | "Mindset" | "Relationships";
  level: "Beginner" | "Intermediate" | "All levels";
  /** Palette accent used for the course's cover art. */
  accent: "marigold" | "peacock" | "jamun" | "kumkum";
  includes: string[];
  modules: CourseModule[];
};

export type Program = {
  slug: string;
  mode: EnrollMode;
  /** Placeholder data for demos; see the note at the top of this file. */
  mock?: boolean;
  /** Present for self-paced courses. */
  course?: CourseDetails;
  title: string;
  shortTitle: string;
  /** Who it's for, shown as an eyebrow. */
  audience: string;
  /** One-line promise. */
  promise: string;
  summary: string;
  outcomes: string[];
  format: { label: string; value: string }[];
  event?: ProgramEvent;
  /** Price in rupees (GST inclusive). Omit for free / application / enquiry programs. */
  price?: {
    amount: number;
    /** Context shown near the price, e.g. what comparable training costs. */
    anchor?: string;
  };
  /** Hosted Razorpay payment page used when API keys are not configured. */
  paymentLink?: string;
  guarantee?: string;
  /** Dedicated long-form landing page, if one exists. */
  landingPath?: string;
  forYou?: string[];
  notForYou?: string[];
  agenda?: { title: string; points: string[] }[];
  faqs: { q: string; a: string }[];
  /** Assessment patterns this program addresses. */
  addresses: PatternId[];
  /**
   * Client stories (ids from src/content/testimonials.ts) shown beside this
   * program. Each card shows the story's own context, so nothing implies a
   * quote came from a program it didn't. Omit to show every testimonial.
   */
  testimonialIds?: string[];
};

const livePrograms: Program[] = [
  {
    slug: "be-heard-masterclass",
    mode: "free",
    mock: true,
    title: "Be Heard, Understood & Emotionally Respected",
    shortTitle: "Be Heard masterclass",
    audience: "For working women",
    promise: "Express what you feel without fighting, shouting, or feeling guilty.",
    summary:
      "A free live masterclass for working women who manage everything at work and at home, yet still feel unheard. Learn to express your feelings clearly, stop replaying conversations, and build calmer, more respectful relationships.",
    outcomes: [
      "Express your feelings clearly, without guilt and without being misunderstood",
      "Stop replaying what you said, or should have said",
      "Shift the dynamic so your voice is valued in every relationship",
      "Let go of the emotional weight you've been carrying silently",
      "Build deeper, calmer relationships without losing yourself",
    ],
    format: [
      { label: "Format", value: "Live online masterclass" },
      { label: "Platform", value: "Zoom" },
      { label: "Language", value: "Hindi / English" },
      { label: "Includes", value: "Live Q&A with Manisha" },
    ],
    event: {
      startsAt: "2026-12-05T18:00:00+05:30", // MOCK date for demos (last real session: 8 May 2026)
      durationMinutes: 90, // TODO: confirm (the current page does not state a duration)
      platform: "Zoom",
      language: "Hindi / English",
      capacity: 100,
      recordingAvailable: false,
    },
    landingPath: "/masterclass",
    forYou: [
      "You feel emotionally overwhelmed and don't know why",
      "You struggle to express your feelings without guilt",
      "You feel unheard or misunderstood in your relationships",
      "You want peaceful, stronger, calmer connections",
      "You're open to understanding your emotional patterns",
    ],
    notForYou: [
      "You're looking for quick hacks without any inner change",
      "You're not open to looking at your emotional patterns",
      "You won't show up live, even though it's free",
    ],
    faqs: [
      {
        q: "What is this masterclass about?",
        a: "It focuses on designing beautiful relationships. You'll understand how your emotions work, and how to express them in a way that creates connection rather than conflict.",
      },
      {
        q: "Will this help me stop overthinking conversations?",
        a: "Yes. You'll learn how to stop emotional over-processing — the habit of replaying conversations and worrying about what was said — with practical tools you can use from day one.",
      },
      {
        q: "I've never worked on my emotions before. Is that okay?",
        a: "Yes. The session is designed to be clear, practical and immediately usable, even if this is completely new to you.",
      },
      {
        q: "How do I join?",
        a: "It's a live online masterclass on Zoom, so you can attend from home. The joining link is shared in the WhatsApp community after you register.",
      },
      {
        q: "Is it really free?",
        a: "Yes, 100% free. No hidden charges. Register, show up, and experience the shift.",
      },
      {
        q: "Will there be a recording?",
        a: "No. This is a live session; the real-time experience and Q&A can't be replicated on a replay. Please plan to attend live.",
      },
    ],
    addresses: ["self-last", "what-if"],
    testimonialIds: ["mayukhi-sen", "ashwini-shenoy"],
  },
  {
    slug: "leadership-confidence-workshop",
    mode: "paid",
    mock: true,
    title: "Lead with Confidence: The 3-Hour Leadership Workshop",
    shortTitle: "Leadership workshop",
    audience: "For working professionals ready to lead",
    promise: "Build confidence like a leader, think with clarity, lead with emotional intelligence, and act consistently.",
    summary:
      "A live, practical 3-hour workshop for corporate professionals who know they're meant to lead. Stop second-guessing decisions, speak with confidence in meetings, and break the procrastination loops that hold your growth back.",
    outcomes: [
      "Stop second-guessing your decisions",
      "Speak with confidence in meetings",
      "Break the procrastination loops that sabotage growth",
      "Respond instead of reacting in high-pressure situations",
    ],
    format: [
      { label: "Format", value: "Live 3-hour workshop" },
      { label: "Platform", value: "Zoom" },
      { label: "Language", value: "English" },
      { label: "Guarantee", value: "100% money-back" },
    ],
    event: {
      startsAt: "2026-12-12T18:00:00+05:30", // MOCK date for demos (last real session: 22 May 2026)
      durationMinutes: 180,
      platform: "Zoom",
      language: "English",
      recordingAvailable: false,
    },
    price: {
      amount: 9,
      anchor: "Corporate training for these skills typically costs ₹10,000–₹50,000+ per program.",
    },
    paymentLink: "https://rzp.io/rzp/CeNQJDY",
    guarantee:
      "If you attend the session and feel you didn't receive clear, practical leadership tools you can apply immediately in meetings, decision-making and high-pressure situations, contact us after the session for a full refund. No hassle.",
    landingPath: "/leadership-workshop",
    forYou: [
      "You're a working professional aged 28+ in a corporate role, ready for growth",
      "You feel ready for leadership, but don't feel \"seen\" as a leader",
      "You overthink decisions and replay conversations",
      "You delay important actions due to fear, perfectionism, or confusion",
      "You want to speak with confidence and be taken seriously",
      "You react in high-pressure situations when you'd rather respond",
    ],
    notForYou: [
      "You want motivation with zero action",
      "You blame your boss, your company, or \"luck\" for everything",
      "You're looking for therapy (this is leadership training)",
      "You're currently looking for a job",
    ],
    agenda: [
      {
        title: "Hour 1 · Clarity + an anti-procrastination action system",
        points: [
          "Decision-making under uncertainty",
          "Stopping perfection loops",
          "A simple execution protocol for weekly performance",
        ],
      },
      {
        title: "Hour 2 · Confidence that looks like leadership",
        points: [
          "Why capable professionals hesitate",
          "Building calm authority under pressure",
          "Executive presence micro-habits",
        ],
      },
      {
        title: "Hour 3 · Emotional intelligence that commands respect",
        points: [
          "How leaders respond instead of react",
          "Handling your own emotions in high-pressure situations",
          "Handling the emotions of the room with empathy",
        ],
      },
    ],
    faqs: [
      {
        q: "Will this work if I'm introverted?",
        a: "Yes. Leadership is not about being loud; it's about being clear and composed. This training focuses on structured thinking, calm communication and executive presence, skills that often suit introverts extremely well. You don't need to change your personality. You need to strengthen your delivery.",
      },
      {
        q: "Is this for managers only?",
        a: "No. It's for working professionals in corporate roles who want to step into leadership: executives, team leads, project leads, consultants, analysts, engineers, and managers.",
      },
      {
        q: "Do I need prior leadership experience?",
        a: "No. The workshop is built for capable professionals who are ready to be seen as leaders, whether or not they manage a team today.",
      },
      {
        q: "What if I'm not confident at all?",
        a: "That's exactly who this is for. Hour 2 is dedicated to building calm authority step by step, with micro-habits you can practise from the next meeting onwards.",
      },
      {
        q: "I'm super busy. Is it worth three hours?",
        a: "The session is designed to give you a practical system you can use every week, so the time comes back to you in fewer stalled decisions and less procrastination.",
      },
      {
        q: "What if I miss the session?",
        a: "This is a live workshop, so please plan to attend live. If something comes up, message the team on WhatsApp before the session starts.",
      },
      {
        q: "What if it doesn't work for me?",
        a: "Attend the session. If you don't get clear, practical tools you can apply immediately, contact us afterwards for a full refund.",
      },
    ],
    addresses: ["readiness", "what-if", "waiting"],
    testimonialIds: ["ruchi-bansal", "mayukhi-sen"],
  },
  {
    slug: "one-to-one-coaching",
    mode: "application",
    title: "1:1 Leadership Coaching",
    shortTitle: "1:1 coaching",
    audience: "For emerging and established leaders",
    promise: "Build influence, strategic thinking and executive presence, at your pace and on your goals.",
    summary:
      "Personalised coaching for professionals stepping into bigger roles. Together we work on the patterns that hold you back, from overthinking to people-pleasing, and build the clarity, confidence and presence your next level needs.",
    outcomes: [
      "Clarity on your goals, values and leadership strengths",
      "Confidence to take initiative without overthinking others' opinions",
      "Executive presence in meetings and high-stakes conversations",
      "A practical plan you act on between sessions",
    ],
    format: [
      { label: "Format", value: "Private online sessions" },
      { label: "Language", value: "English / Hindi" },
      { label: "Starts with", value: "A free clarity call" },
      { label: "Investment", value: "Shared on your clarity call" },
    ],
    faqs: [
      {
        q: "How does it start?",
        a: "Apply below and we'll reach out to book a free clarity call. On the call, we'll look at your goals and decide together whether coaching is the right fit.",
      },
      {
        q: "How long is the engagement?",
        a: "It depends on your goals. Manisha will recommend a format and duration on your clarity call.",
      },
      {
        q: "Is it confidential?",
        a: "Yes. What you share in coaching stays between you and your coach.",
      },
    ],
    addresses: ["what-if", "readiness", "self-last", "waiting"],
    testimonialIds: ["ruchi-bansal", "ashwini-shenoy"],
  },
  {
    slug: "mindset-mastery",
    mode: "application",
    title: "Personal Growth & Mindset Mastery",
    shortTitle: "Mindset Mastery",
    audience: "For anyone ready to take charge of their growth",
    promise: "Overcome self-doubt, master decision-making, and take control of your success journey.",
    summary:
      "A guided growth journey to reconnect with yourself and reclaim your inner power. Work through the patterns that keep you waiting, postponing and going with the flow, and replace them with clear choices and consistent action.",
    outcomes: [
      "Recognise and interrupt your own limiting patterns",
      "Make decisions with clarity instead of fear",
      "Set boundaries that protect your energy",
      "Align your daily actions with your vision",
    ],
    format: [
      { label: "Format", value: "Guided online program" },
      { label: "Language", value: "English / Hindi" },
      { label: "Starts with", value: "A free clarity call" },
      { label: "Investment", value: "Shared on your clarity call" },
    ],
    faqs: [
      {
        q: "Is this different from 1:1 leadership coaching?",
        a: "Mindset Mastery focuses on personal growth: self-doubt, decisions, boundaries and ownership. Leadership coaching focuses on your role at work. Many clients start with one and add the other.",
      },
      {
        q: "How do I know which is right for me?",
        a: "Take the free Power Self-Assessment, then book a clarity call. Manisha will recommend the best starting point.",
      },
    ],
    addresses: ["waiting", "readiness", "self-last"],
    testimonialIds: ["ashwini-shenoy", "ruchi-bansal"],
  },
  {
    slug: "corporate-training",
    mode: "enquiry",
    title: "Corporate Trainings & Workshops",
    shortTitle: "Corporate training",
    audience: "For HR, L&D and DEI leaders",
    promise: "High-impact training on leadership, resilience, emotional intelligence and communication.",
    summary:
      "Workshops and programs for teams, managers and women's networks, delivered by a coach who spent two decades leading inside global corporations. Including Power*N, the inner-power session run for the Aptiv DEI Council for women in engineering.",
    outcomes: [
      "Leaders who make clearer decisions under pressure",
      "Teams that communicate with emotional intelligence",
      "Women professionals who claim their voice and their seat at the table",
      "Practical tools participants use the next working day",
    ],
    format: [
      { label: "Format", value: "In-person or virtual" },
      { label: "Group size", value: "Teams to large cohorts" },
      { label: "Length", value: "90-minute sessions to multi-week programs" },
      { label: "Investment", value: "Custom proposal" },
    ],
    landingPath: "/corporate",
    faqs: [
      {
        q: "Can the session be customised for our organisation?",
        a: "Yes. Every engagement starts with a briefing call to understand your people, goals and context, followed by a tailored proposal.",
      },
      {
        q: "Do you run sessions for women's networks and DEI councils?",
        a: "Yes. Power*N was delivered for the Aptiv Technical Center India DEI Council for women in engineering.",
      },
    ],
    addresses: ["readiness", "what-if", "self-last", "waiting"],
    testimonialIds: ["mayukhi-sen"],
  },
];

export const programs: Program[] = [...livePrograms, ...courses];

export function getProgram(slug: string): Program | undefined {
  return programs.find((p) => p.slug === slug);
}

/** Programs a visitor can enroll in or apply to (excludes corporate enquiries). */
export const enrollablePrograms = programs.filter((p) => p.mode !== "enquiry");

/** Whether a dated event is still open for registration at `now`. */
export function isEventOpen(program: Program, now: Date = new Date()): boolean {
  if (!program.event) return true;
  return new Date(program.event.startsAt).getTime() > now.getTime();
}
