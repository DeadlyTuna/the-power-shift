import { HandUnderline } from "@/components/home/HandUnderline";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";
import { Section } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";

/**
 * Manisha's own description of her approach ("practical, precise, and rooted
 * in real corporate reality"), each word expanded only with material from
 * her programs.
 *
 * "Lived experience" gets a hand-drawn marigold underline on first view, and
 * the three principles step in one after another.
 */
const principles = [
  {
    title: "Practical",
    body: "Tools you can use in your next meeting, decision or high-pressure conversation, not theory to file away.",
  },
  {
    title: "Precise",
    body: "You work on the one pattern that is costing you the most today, rather than everything at once.",
  },
  {
    title: "Rooted in corporate reality",
    body: "Taught by someone who has led teams and made high-pressure decisions inside complex corporate structures.",
  },
];

export function HowSheWorks() {
  return (
    <Section tone="jamun" aria-labelledby="how-title">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-20">
        <Reveal>
          <p className="eyebrow text-marigold-300">How she works</p>
          <h2 id="how-title" className="display-lg mt-4">
            She doesn&rsquo;t teach leadership from theory.
          </h2>
          <p className="lede mt-6 max-w-2xl text-jamun-100">
            She teaches it from <HandUnderline>lived experience</HandUnderline>: practical, precise, and rooted in real
            corporate reality. Because true leadership isn&rsquo;t about being louder.
          </p>
        </Reveal>
        <Reframe
          tone="dark"
          size="lg"
          script="Leadership means being the loudest voice."
          shift="Leadership means being unshakably clear."
          className="border-l-2 border-marigold-400 pl-5 sm:pl-7"
        />
      </div>

      <StaggerList stagger={0.12} amount={0.3} className="mt-14 grid gap-8 md:grid-cols-3 md:gap-10 lg:mt-20">
        {principles.map((p) => (
          <StaggerListItem key={p.title} className="border-t border-white/15 pt-6">
            <h3 className="display-sm">{p.title}</h3>
            <p className="mt-3 text-jamun-100">{p.body}</p>
          </StaggerListItem>
        ))}
      </StaggerList>
    </Section>
  );
}
