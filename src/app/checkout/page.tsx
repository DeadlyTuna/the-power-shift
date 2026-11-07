import type { Metadata } from "next";
import { connection } from "next/server";
import { Section } from "@/components/ui/Layout";
import { CheckoutForm } from "@/components/merch/CheckoutForm";
import { paymentsConfigured } from "@/lib/payments/razorpay";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Checkout",
  description: "Add your shipping details and place your merch order.",
  path: "/checkout",
  noindex: true,
});

export default async function CheckoutPage() {
  // Read payment settings per request so switching Razorpay on or off needs no rebuild.
  await connection();
  const paymentMode = paymentsConfigured() ? "razorpay" : "whatsapp";

  return (
    <Section tone="paper" className="pt-10 pb-20 md:pt-14 md:pb-28">
      <h1 className="display-lg">Checkout</h1>
      <CheckoutForm paymentMode={paymentMode} />
    </Section>
  );
}
