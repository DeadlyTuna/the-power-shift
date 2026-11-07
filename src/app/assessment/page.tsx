import type { Metadata } from "next";
import { AssessmentApp } from "@/components/assessment/AssessmentApp";
import { JsonLd } from "@/components/shared/JsonLd";
import { assessmentCopy, statements } from "@/content/assessment";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free Power Self-Assessment",
  description: `Where is your power leaking? Rate ${statements.length} short statements in about ${assessmentCopy.minutes} minutes and get your power score, your four patterns, and one practice to try in the next 24 hours. A free self-reflection tool by Leadership Coach Manisha Agrawal.`,
  path: "/assessment",
});

export default function AssessmentPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Power Self-Assessment", path: "/assessment" },
        ])}
      />
      <AssessmentApp />
    </>
  );
}
