import type { Metadata } from "next";
import { AuthShell } from "@/components/account/AuthCard";
import { ForgotPasswordForm } from "@/components/account/PasswordRecovery";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Reset your password",
  description: "Get a link to reset your student account password.",
  path: "/account/forgot-password",
  noindex: true,
});

export default function Page() {
  return (
    <AuthShell panel="sign-in">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
