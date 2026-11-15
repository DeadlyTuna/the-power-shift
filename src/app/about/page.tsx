import type { Metadata } from "next";
import { assessmentCopy, statements } from "@/content/assessment";
import { credentials, site } from "@/content/site";
import { AboutHero } from "@/components/about/AboutHero";
import { HowSheWorks } from "@/components/about/HowSheWorks";
import { StoryChapters } from "@/components/about/StoryChapters";
import { ClosingBand } from "@/components/home/ClosingBand";
import { MissionMoment } from "@/components/home/MissionMoment";
import { ShiftJourney } from "@/components/home/ShiftJourney";
import { TestimonialsBand } from "@/components/home/TestimonialsBand";
import { joinList } from "@/components/programs/program-helpers";
import { JsonLd } from "@/components/shared/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { breadcrumbJsonLd, pageMetadata, personJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `About ${site.coach}`,
  description: `${site.coach} is a ${site.role} with ${credentials.corporateYears} years of corporate leadership across ${joinList(credentials.countries)}, and ${credentials.coachingYears} years of coaching. Her story, how she works, and her mission.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          personJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: `About ${site.coach}`, path: "/about" },
          ]),
        ]}
      />

      <AboutHero />
      <StoryChapters />
      <HowSheWorks />
      <ShiftJourney tone="paper" />
      <MissionMoment tone="mist" />
      <TestimonialsBand tone="paper" />

      <ClosingBand
        id="about-next-step"
        eyebrow="Start here"
        title="The first shift is noticing"
        body={`Rate ${statements.length} short statements in about ${assessmentCopy.minutes} minutes and see which pattern is costing you the most today. Or talk it through with Manisha on a free clarity call.`}
        actions={
          <>
            <ButtonLink
              href="/assessment"
              size="lg"
              arrow
              className="px-6 text-base text-balance sm:px-8 sm:text-[1.0625rem]"
            >
              Take the free Power Self-Assessment
            </ButtonLink>
            <ButtonLink href="/book" size="lg" variant="on-dark">
              Book a free clarity call
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
