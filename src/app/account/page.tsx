import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "My courses",
  description: "Your enrolled courses and lesson progress.",
  path: "/account",
  noindex: true,
});

export default function AccountPage() {
  return <AccountDashboard />;
}
