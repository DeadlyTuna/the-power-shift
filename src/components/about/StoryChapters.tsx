import type { ReactNode } from "react";
import { credentials, site } from "@/content/site";
import { joinList } from "@/components/programs/program-helpers";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Layout";

/**
 * Manisha's story in three chapters, told only from the client's own copy:
 * the "About the Coach" bio, the masterclass coach section, and the Power*N
 * session at Aptiv. Each chapter rises into place as it's reached.
 */

type Chapter = { id: string; label: string; title: string; body: ReactNode };

const firstName = site.coach.split(" ")[0];
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

const chapters: Chapter[] = [
  {
    id: "corporate",
    label: "The corporate years",
    title: "Two decades inside global corporations",
    body: (
      <>
        <p>
          {firstName} is an {lowerFirst(credentials.education)}. She spent {credentials.corporateYears} years in
          corporate leadership, across global environments including {joinList(credentials.countries)}.
        </p>
        <p>
          She led teams, navigated high-pressure decisions and operated at boardroom level within complex corporate
          structures.
        </p>
      </>
    ),
  },
  {
    id: "coaching",
    label: "The move to coaching",
    title: "From leading teams to coaching leaders",
    body: (
      <>
        <p>
          After two decades in leadership roles, she moved into coaching: helping working professionals build clarity,
          confidence and emotional intelligence to step into stronger leadership positions.
        </p>
        <p>
          With {credentials.coachingYears} years of coaching experience and award-winning recognition, she brings a rare
          blend of strategic corporate insight and deep psychological understanding.
        </p>
        <p>
          As an in-house agile coach at Aptiv, she led Power*N, an inner-power session for the Aptiv Technical Center
          India DEI Council for women in engineering.
        </p>
        <ButtonLink href="/corporate" variant="link" arrow className="min-h-11">
          Corporate training with Manisha
        </ButtonLink>
      </>
    ),
  },
  {
    id: "women",
    label: "Her work with women",
    title: "Helping women be truly heard",
    body: (
      <>
        <blockquote className="border-l-2 border-marigold-400 pl-5 sm:pl-6">
          <p className="font-display text-[1.375rem] leading-snug text-jamun-900 sm:text-[1.625rem]">
            &ldquo;I&rsquo;ve spent years understanding what holds women back from being truly heard, and it&rsquo;s
            almost never about not trying hard enough. It&rsquo;s about emotional patterns that were never taught to
            us.&rdquo;
          </p>
        </blockquote>
        <p>
          Through her masterclass for working women, she helps women understand their emotional patterns, stop feeling
          unheard in their relationships, and build peaceful, respectful connections, so they can feel calm, valued and
          emotionally strong without losing themselves.
        </p>
        <ButtonLink href="/masterclass" variant="link" arrow className="min-h-11">
          About the Be Heard masterclass
        </ButtonLink>
      </>
    ),
  },
];

export function StoryChapters() {
  return (
    <Section tone="white" aria-labelledby="story-title">
      <Reveal className="max-w-3xl">
        <p className="eyebrow text-marigold-700">Her story</p>
        <h2 id="story-title" className="display-lg mt-4">
          Built in boardrooms, brought to coaching
        </h2>
      </Reveal>

      <ol className="mt-12 border-b border-line lg:mt-16">
        {chapters.map((chapter, i) => (
          <li
            key={chapter.id}
            className="grid gap-5 border-t border-line py-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16 lg:py-14"
          >
            <Reveal amount={0.3}>
              <p className="flex items-baseline gap-3">
                <span aria-hidden="true" className="font-display text-xl leading-none text-marigold-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="eyebrow text-[0.75rem] text-muted">{chapter.label}</span>
              </p>
              <h3 className="display-md mt-4">{chapter.title}</h3>
            </Reveal>
            <Reveal
              amount={0.2}
              delay={0.12}
              className="flex max-w-2xl flex-col items-start gap-5 text-lg leading-relaxed text-ink"
            >
              {chapter.body}
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
