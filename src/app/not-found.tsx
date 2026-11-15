import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";

/**
 * 404. Kept quiet on purpose: the Reframe signature is reserved for real
 * limiting beliefs, and a missing page isn't one.
 */
export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col justify-center py-24">
      <p className="eyebrow text-marigold-700">Page not found</p>
      <h1 className="display-lg mt-4 max-w-2xl text-jamun-900">We couldn&apos;t find that page.</h1>
      <p className="lede mt-6 max-w-xl text-muted">
        The link may be old or mistyped. Start from the home page, or find out where your power is leaking with the free
        Power Self-Assessment.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/" variant="dark" arrow>
          Go to the home page
        </ButtonLink>
        <ButtonLink href="/assessment" variant="outline" className="text-balance">
          Take the free Power Self-Assessment
        </ButtonLink>
      </div>
    </Container>
  );
}
