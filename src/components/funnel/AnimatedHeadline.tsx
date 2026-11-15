import { Fragment } from "react";
import { TextAnimate } from "@/components/kit/text-animate";

/**
 * A hero headline whose words drift up out of a soft blur, one after another,
 * as the page loads. Hero headlines only: one per page.
 *
 * The heading stays a plain h1/h2 with the full sentence in it for screen
 * readers and search; the moving words are a visual copy hidden from
 * assistive tech. Each word is its own TextAnimate with ordinary spaces in
 * between, so lines wrap exactly like plain text (no stray space at the start
 * of a line). Without JavaScript the words are simply shown (framer renders
 * them transparent on the server, so the html:not(.js) overrides put them
 * back), and with reduced motion only a quick fade remains.
 */
export function AnimatedHeadline({
  children,
  as: Heading = "h1",
  id,
  className,
  delay = 0.05,
  step = 0.07,
}: {
  children: string;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between one word and the next. */
  step?: number;
}) {
  const words = children.split(/\s+/).filter(Boolean);
  return (
    <Heading id={id} className={className}>
      <span className="sr-only">{children}</span>
      <span
        aria-hidden="true"
        className="[html:not(.js)_&_span]:opacity-100! [html:not(.js)_&_span]:transform-none! [html:not(.js)_&_span]:filter-none!"
      >
        {words.map((word, i) => (
          <Fragment key={i}>
            {i > 0 ? " " : null}
            <TextAnimate
              as="span"
              by="text"
              animation="blurInUp"
              startOnView={false}
              once
              accessible={false}
              delay={delay + i * step}
              duration={0.5}
            >
              {word}
            </TextAnimate>
          </Fragment>
        ))}
      </span>
    </Heading>
  );
}
