import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, AuthSkeleton } from "@/components/account/AuthCard";
import { SignInForm } from "@/components/account/SignInForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to your student account to see your courses and carry on from your last lesson.",
  path: "/account/sign-in",
  noindex: true,
});

export default function SignInPage() {
  return (
    <AuthShell panel="sign-in">
      {/* The form reads ?next= on the client, so it renders inside a Suspense boundary. */}
      <Suspense fallback={<AuthSkeleton title="Sign in" />}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
