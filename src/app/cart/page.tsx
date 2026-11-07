import type { Metadata } from "next";
import { Section } from "@/components/ui/Layout";
import { CartView } from "@/components/merch/CartView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Your cart",
  description: "Review the merch in your cart, then continue to checkout.",
  path: "/cart",
  noindex: true,
});

export default function CartPage() {
  return (
    <Section tone="paper" className="pt-10 pb-20 md:pt-14 md:pb-28">
      <h1 className="display-lg">Your cart</h1>
      <CartView />
    </Section>
  );
}
