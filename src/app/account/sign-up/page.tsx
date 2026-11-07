import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, AuthSkeleton } from "@/components/account/AuthCard";
import { SignUpForm } from "@/components/account/SignUpForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Create account",
  description: "Create a free student account to enrol in self-paced courses and keep track of your lessons.",
  path: "/account/sign-up",
  noindex: true,
});

export default function SignUpPage() {
  return (
    <AuthShell panel="sign-up">
      <Suspense fallback={<AuthSkeleton title="Create account" />}>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
