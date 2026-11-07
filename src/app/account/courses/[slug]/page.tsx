import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { courses, getCourse } from "@/content/courses";
import { CoursePlayer } from "@/components/account/CoursePlayer";
import { Section } from "@/components/ui/Layout";
import { pageMetadata } from "@/lib/seo";

/** Only the self-paced courses have a player; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return courses.filter((c) => c.course).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return pageMetadata({
    title: `${course.shortTitle}: lessons`,
    description: `Lessons and progress for ${course.title}.`,
    path: `/account/courses/${slug}`,
    noindex: true,
  });
}

export default async function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course?.course) notFound();

  return (
    // The player reads ?lesson= on the client, so it renders inside a Suspense boundary.
    <Suspense
      fallback={
        <Section tone="paper" className="pt-6 pb-20 md:pt-10" aria-busy="true">
          <p className="eyebrow mt-4 text-marigold-700">My courses</p>
          <h1 className="display-md mt-2">{course.title}</h1>
          <div aria-hidden="true" className="mt-10 aspect-video animate-pulse rounded-card bg-mist lg:w-[calc(100%-24.5rem)]" />
        </Section>
      }
    >
      <CoursePlayer slug={slug} />
    </Suspense>
  );
}
