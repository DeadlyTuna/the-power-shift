import type { Metadata } from "next";
import { communityLink, site } from "@/content/site";
import { AssessmentPromo } from "@/components/assessment/AssessmentPromo";
import { ClosingBand } from "@/components/home/ClosingBand";
import { HomeHero } from "@/components/home/HomeHero";
import { MeetManisha } from "@/components/home/MeetManisha";
import { MerchTeaser } from "@/components/home/MerchTeaser";
import { MissionMoment } from "@/components/home/MissionMoment";
import { ShiftJourney } from "@/components/home/ShiftJourney";
import { SoundFamiliar } from "@/components/home/SoundFamiliar";
import { TestimonialsBand } from "@/components/home/TestimonialsBand";
import { WaysToWork } from "@/components/home/WaysToWork";
import { JsonLd } from "@/components/shared/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { organizationJsonLd, pageMetadata, personJsonLd } from "@/lib/seo";

const HOME_TITLE = `${site.brand} · ${site.coach}, ${site.role}`;

export const metadata: Metadata = {
  ...pageMetadata({ title: HOME_TITLE, description: site.description, path: "/" }),
  // Keep the layout's default title rather than running it through the "%s · The Power Shift" template.
  title: { absolute: HOME_TITLE },
};

export default function HomePage() {
  const community = communityLink();

  return (
    <>
      <JsonLd data={[personJsonLd(), organizationJsonLd()]} />

      <HomeHero />
      <SoundFamiliar />
      <ShiftJourney tone="paper" />
      <AssessmentPromo tone="jamun" />
      <WaysToWork />
      <MeetManisha />
      <MissionMoment tone="mist" />
      <TestimonialsBand tone="paper" />
      <MerchTeaser />

      <ClosingBand
        id="next-step"
        eyebrow="Your next step"
        title="Talk it through with Manisha"
        body="On a free clarity call, you’ll look at your goals, what’s getting in the way, and the right place for you to start."
        actions={
          <>
            <ButtonLink href="/book" size="lg" arrow>
              Book a free clarity call
            </ButtonLink>
            <ButtonLink href={community.href} size="lg" variant="on-dark" icon={<WhatsAppIcon />}>
              {community.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </ButtonLink>
          </>
        }
        note="The WhatsApp community is where live session updates and joining links are shared."
      />
    </>
  );
}
