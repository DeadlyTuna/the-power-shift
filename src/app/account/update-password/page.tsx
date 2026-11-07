import type { Metadata } from "next";
import { AuthShell } from "@/components/account/AuthCard";
import { UpdatePasswordForm } from "@/components/account/PasswordRecovery";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Choose a new password",
  description: "Set a new password for your student account.",
  path: "/account/update-password",
  noindex: true,
});

export default function Page() {
  return (
    <AuthShell panel="sign-in">
      <UpdatePasswordForm />
    </AuthShell>
  );
}
