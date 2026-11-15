/** Choices for "How did you hear about Manisha?", shared by the application form and /api/apply. */
export const HEARD_FROM = [
  "Instagram",
  "LinkedIn",
  "Facebook",
  "WhatsApp",
  "Friend or colleague",
  "Google",
  "Other",
] as const;

export type HeardFrom = (typeof HEARD_FROM)[number];

export const heardFromOptions = HEARD_FROM.map((value) => ({ value, label: value }));
