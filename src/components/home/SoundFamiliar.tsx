import { Reveal } from "@/components/motion/Reveal";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Layout";

/**
 * The problem in the reader's own words. Each line is adapted from the
 * client's copy: the original home page (worked hard, something missing,
 * self-doubt, leadership challenges, lack of clarity), the leadership
 * workshop (second-guessing, "not seen as a leader") and the masterclass
 * for working women (managing work and home, still unheard).
 */
const voices = [
  "I’m good at my job, yet I second-guess myself when it matters most.",
  "I feel ready to lead, but I’m not seen as a leader yet.",
  "I manage work and home, and still feel unheard.",
  "I’ve worked hard for years, and I can’t name what’s missing.",
];

/** The four voices arrive one after another, as if spoken in turn. */
export function SoundFamiliar() {
  return (
    <Section tone="white" aria-labelledby="familiar-title">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="familiar-title" className="display-lg">
            Sound familiar?
          </h2>
          <p className="lede mt-5 max-w-md text-muted">
            You deliver. You&rsquo;re responsible. You&rsquo;re ambitious. And still, something holds you back.
          </p>
        </Reveal>

        <div>
          <StaggerList stagger={0.14} amount={0.25} className="border-b border-line">
            {voices.map((voice) => (
              <StaggerListItem
                key={voice}
                className="border-t border-line py-5 font-display text-[1.375rem] leading-snug text-jamun-900 sm:py-6 sm:text-[1.75rem]"
              >
                <span aria-hidden="true" className="text-marigold-700">
                  &ldquo;
                </span>
                {voice}
                <span aria-hidden="true" className="text-marigold-700">
                  &rdquo;
                </span>
              </StaggerListItem>
            ))}
          </StaggerList>

          <Reveal delay={0.2} amount={0.4}>
            <p className="mt-8 max-w-xl text-lg text-ink">
              Not because you aren&rsquo;t capable. Because a silent script is running: overthinking, perfectionism,
              fear of judgment and &ldquo;what if I&rsquo;m wrong?&rdquo;{" "}
              <strong className="font-semibold text-jamun-900">
                Scripts are learned, which means they can be unlearned.
              </strong>
            </p>
            <ButtonLink href="/assessment" variant="link" arrow className="mt-4 min-h-11">
              Take the free Power Self-Assessment
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
