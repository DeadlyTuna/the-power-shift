/**
 * Site-wide content and settings.
 *
 * Everything the coach is likely to change (contact details, links,
 * credentials, services) lives here so that pages stay presentational.
 * Values marked TODO need confirming before launch.
 */

export const site = {
  brand: "The Power Shift",
  coach: "Manisha Agrawal",
  role: "Leadership & Life Coach",
  tagline: "Lead. Inspire. Succeed.",
  domain: "itzmanisha.com",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://itzmanisha.com").replace(/\/$/, ""),
  description:
    "Leadership and life coaching with Manisha Agrawal: 20+ years of global corporate leadership, 8+ years of coaching. Programs, corporate training and a free Power Self-Assessment for working professionals and women leaders.",

  contact: {
    phoneDisplay: "+91 79755 92681",
    phoneE164: "+917975592681",
    email: "ambitions2021@gmail.com",
    whatsappNumber: "917975592681",
    whatsappGreeting: "Hi Manisha, I'd like to know more about your coaching programs.",
    hours: "Mon–Sat, 10 AM – 7 PM IST",
  },

  /** WhatsApp community invite link for workshop updates. TODO: add the real chat.whatsapp.com link. */
  whatsappCommunityUrl: process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL ?? "",

  /** Calendly / Cal.com link for discovery calls. When empty, the booking page uses a request form. */
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",

  /** Social profiles. Empty values are not rendered. TODO: add real profile URLs. */
  social: {
    linkedin: "",
    instagram: "",
    youtube: "",
    facebook: "",
  },

  /** Business details shown on legal pages (required by Razorpay). TODO: confirm all values. */
  legal: {
    entityName: "Manisha Agrawal",
    address: "", // TODO: registered business address, shown on Contact and Terms pages
    city: "Bengaluru, Karnataka, India", // TODO: confirm
    gstin: "", // TODO: add if registered
    jurisdiction: "Bengaluru, Karnataka",
    lastUpdated: "2026-10-05",
  },

  /** Optional media. Drop files into /public and set the paths here. */
  media: {
    portrait: "", // e.g. "/images/manisha-portrait.jpg" (4:5 portrait works best)
    missionVideo: "", // e.g. "/media/mission.mp4" (the 14-second mission clip from the current site)
    missionVideoPoster: "",
  },
} as const;

export type NavItem = { label: string; href: string };

export const primaryNav: NavItem[] = [
  { label: "Programs", href: "/programs" },
  { label: "Courses", href: "/courses" },
  { label: "Assessment", href: "/assessment" },
  { label: "Corporate", href: "/corporate" },
  { label: "Merch", href: "/merch" },
  { label: "About", href: "/about" },
];

export const footerNav: { heading: string; links: NavItem[] }[] = [
  {
    heading: "Work with Manisha",
    links: [
      { label: "All programs", href: "/programs" },
      { label: "Self-paced courses", href: "/courses" },
      { label: "Free masterclass for women", href: "/masterclass" },
      { label: "Leadership workshop", href: "/leadership-workshop" },
      { label: "Corporate training", href: "/corporate" },
      { label: "Book a clarity call", href: "/book" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { label: "Power Self-Assessment", href: "/assessment" },
      { label: "Merch", href: "/merch" },
      { label: "About Manisha", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms & conditions", href: "/terms" },
      { label: "Refunds & cancellations", href: "/refund-policy" },
      { label: "Shipping & delivery", href: "/shipping-policy" },
    ],
  },
];

/** Verified facts about the coach, used on About, landing pages and structured data. */
export const credentials = {
  corporateYears: "20+",
  coachingYears: "8+",
  countries: ["Germany", "China", "Korea", "Sweden", "North America"],
  education: "Engineer with a Master's from IIIT Bengaluru",
  recognition: "Award-winning coach",
  formerRole: "In-house agile coach at Aptiv",
};

export const mission = {
  statement:
    "I am on a mission to ignite the inner strength within every soul: to help people break through limitations, embrace their true potential, and create a life filled with purpose, harmony, and fulfilment.",
  vision: "I am dedicated to fostering a world where everyone feels seen, heard and empowered to lead.",
};

/** The five shifts from the original site, in the order a client moves through them. */
export const journey = [
  { verb: "Reconnect", with: "with yourself" },
  { verb: "Reclaim", with: "your inner power" },
  { verb: "Lead", with: "with confidence and authority" },
  { verb: "Inspire", with: "and influence with impact" },
  { verb: "Succeed", with: "by aligning vision with action" },
];

export const services = [
  {
    id: "mindset",
    title: "Personal Growth & Mindset Mastery",
    body: "Overcome self-doubt, master decision-making, and take control of your success journey.",
    href: "/programs/mindset-mastery",
  },
  {
    id: "leadership",
    title: "Leadership Coaching",
    body: "Tailored coaching for emerging leaders to build influence, strategic thinking, and executive presence.",
    href: "/programs/one-to-one-coaching",
  },
  {
    id: "corporate",
    title: "Corporate Trainings & Workshops",
    body: "High-impact training on leadership, resilience, emotional intelligence, and communication.",
    href: "/corporate",
  },
];

export function whatsappLink(message: string = site.contact.whatsappGreeting) {
  return `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * The WhatsApp community, where joining links and session updates are shared.
 * Until the real invite link is configured (NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL),
 * the link opens a WhatsApp chat with a ready-made request to be added, and its
 * label says so. Use this everywhere the community is offered so the label
 * always matches what the tap does.
 */
export function communityLink(
  fallbackMessage = "Hi Manisha, please add me to The Power Shift WhatsApp community.",
): { href: string; label: string } {
  if (site.whatsappCommunityUrl) {
    return { href: site.whatsappCommunityUrl, label: "Join the WhatsApp community" };
  }
  return { href: whatsappLink(fallbackMessage), label: "Ask to join the WhatsApp community" };
}

export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
