import { mission, site } from "@/content/site";
import { Reveal } from "@/components/motion/Reveal";
import { Section, type SectionTone } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";
import { WordReveal } from "./WordReveal";

/**
 * Mission and vision in Manisha's own words, under one large line taken
 * from the vision. Shows the mission video only when site.media.missionVideo
 * is set; otherwise the words carry it.
 *
 * The headline is revealed slowly, word by word, the first time it scrolls
 * into view; the statements follow.
 */
export function MissionMoment({ tone = "mist", className }: { tone?: SectionTone; className?: string }) {
  // Widen from the literal "" types in site.ts.
  const video: string = site.media.missionVideo;
  const poster: string = site.media.missionVideoPoster;

  return (
    <Section tone={tone} aria-labelledby="mission-title" className={className}>
      <p className="eyebrow text-marigold-700">Mission &amp; vision</p>
      <WordReveal
        as="h2"
        id="mission-title"
        className="display-xl mt-5 max-w-5xl"
        text="Seen, heard and empowered to lead."
        trigger="view"
        stagger={0.16}
        duration={0.9}
      />

      <div
        className={cn(
          "mt-12 grid gap-10 border-t border-jamun-200 pt-10 lg:mt-16 lg:gap-16",
          video ? "lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]" : null,
        )}
      >
        <Reveal delay={0.2} amount={0.25}>
          <figure>
            <div className={cn("grid gap-10", video ? null : "md:grid-cols-2 md:gap-12")}>
              <div>
                <h3 className="text-[0.9375rem] font-semibold text-muted">The mission</h3>
                <blockquote className="mt-3">
                  <p className="text-xl leading-relaxed text-ink sm:text-[1.375rem]">{mission.statement}</p>
                </blockquote>
              </div>
              <div>
                <h3 className="text-[0.9375rem] font-semibold text-muted">The vision</h3>
                <blockquote className="mt-3">
                  <p className="text-xl leading-relaxed text-ink sm:text-[1.375rem]">{mission.vision}</p>
                </blockquote>
              </div>
            </div>
            <figcaption className="mt-8 flex items-center gap-3 font-semibold text-jamun-900">
              <span aria-hidden="true" className="h-px w-6 bg-marigold-700" />
              {site.coach}
            </figcaption>
          </figure>
        </Reveal>

        {video ? (
          <div>
            {/* TODO: add a captions <track> (WebVTT) for the mission clip before launch, for viewers who can't hear it. */}
            <video
              controls
              muted
              playsInline
              preload="none"
              poster={poster || undefined}
              aria-label={`${site.coach} on her mission (video)`}
              className="aspect-video w-full rounded-card bg-jamun-900 object-contain"
            >
              <source src={video} />
              <a href={video} className="text-jamun-100 underline">
                Watch the mission video
              </a>
            </video>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
