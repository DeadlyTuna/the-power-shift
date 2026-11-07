/**
 * Client testimonials, kept verbatim from the current site.
 * `excerpt` is a shorter pull-quote taken from the full text.
 */

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  excerpt: string;
  quote: string;
  context?: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "ruchi-bansal",
    name: "Ruchi Bansal",
    role: "Project Manager",
    excerpt:
      "One of the biggest transformations has been finding the confidence to take initiative without overthinking others' opinions.",
    quote:
      "With Manisha Agrawal's guidance, I've started focusing on discovering my values and strengths. This shift has allowed me to align my actions with my personal goals rather than getting sidetracked by seeking validation. It's been about uncovering my true abilities and using them as the foundation for growth. One of the biggest transformations has been finding the confidence to take initiative without overthinking others' opinions. Thank you, Manisha Agrawal, for your support and wisdom. Your mentorship has sparked exponential change within me, and I'm excited to continue this journey of growth and self-empowerment.",
    context: "1:1 mentorship",
  },
  {
    id: "ashwini-shenoy",
    name: "Ashwini Shenoy",
    role: "Fiction Writer & Software Engineer",
    excerpt:
      "The challenges thoughtfully curated by you have helped me introspect and learn more about myself, my potential and how I can grow.",
    quote:
      "This week has been truly amazing. The challenges thoughtfully curated by you has helped me introspect and learn more about myself, my potential and how I can grow to become a better version of myself. Thank you for doing this.",
    context: "Week-long challenge",
  },
  {
    id: "mayukhi-sen",
    name: "Mayukhi Sen",
    role: "Global Employee Experience, Aptiv",
    excerpt: "More often than not perfection is the enemy of progress. STOP — it is okay to be human.",
    quote:
      "What an amazing session on Power*N led by our in-house agile coach Manisha Agrawal, hosted by #Aptiv Technical Center India, DEI Council for women in engineering. We witnessed how yielding power lies well within us yet we continuously let the YES and NO battle in our mind and let the negativity win. More often than not perfection is the enemy of progress. The role-playing was just apt for us to resonate. It is so natural to be emotional yet we are trying to park it during the day and venting it on soft targets. STOP - it is okay to be human. Opportunity yes, just pass by as we wait for NOTHING, yet what we do when \"O\" comes knocking on the door? Do we network with the right people who bring forth positivity and value in our lives? Time to reflect",
    context: "Power*N corporate session, Aptiv DEI Council",
  },
];
