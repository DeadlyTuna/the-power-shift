import { site, whatsappLink } from "@/content/site";
import { toPaise } from "@/lib/format";
import { apiError, apiOk, parseBody } from "@/lib/http";
import { recordSubmission, SAVE_FAILED_MESSAGE } from "@/lib/leads";
import { compactItems, orderReference, whatsappOrderLink, type MerchCheckoutResponse } from "@/lib/merch/order";
import { priceCart } from "@/lib/merch/pricing";
import { merchCheckoutSchema } from "@/lib/merch/schema";
import {
  createOrder,
  paymentsConfigured,
  publicKeyId,
  sanitizeNotes,
  type CheckoutSession,
} from "@/lib/payments/razorpay";
import { isBot } from "@/lib/validation";

/**
 * Merch checkout.
 *
 * Validates the shipping details, re-prices the cart from the catalog (the
 * browser's prices and totals are never used), records a pending order, then
 * either opens a Razorpay order or, when payments aren't configured, returns
 * a WhatsApp link for confirming the order by message.
 *
 * Razorpay order notes: kind "merch", ref (our PSM- reference), items
 * ("slug:variant:qty,..."), name, phone, pin. /api/payments/verify uses
 * kind + ref to send the shopper to /order/success.
 */

export async function POST(request: Request) {
  const { data, response } = await parseBody(request, merchCheckoutSchema);
  if (response) return response;

  // Honeypot filled: look successful, record nothing.
  if (isBot(data)) {
    return apiOk<MerchCheckoutResponse>({ mode: "whatsapp", url: whatsappLink(), reference: orderReference() });
  }

  const cart = priceCart(data.lines);
  if (cart.errors.length > 0) {
    return apiError(409, `Your cart needs a change before you can order. ${cart.errors.join(" ")}`);
  }
  if (cart.lines.length === 0 || cart.total <= 0) {
    return apiError(409, "Your cart is empty. Add something before checking out.");
  }
  if (data.expectedTotal !== undefined && data.expectedTotal !== cart.total) {
    return apiError(
      409,
      "Prices in your cart have changed since you opened this page. Check the updated total, then place your order again.",
    );
  }

  const reference = orderReference();
  const payment = paymentsConfigured() ? "razorpay" : "whatsapp";
  const items = cart.lines.map((l) => ({
    slug: l.product.slug,
    name: l.product.name,
    variant: l.variant ?? "",
    qty: l.qty,
    unitPrice: l.unitPrice,
    lineTotal: l.lineTotal,
  }));

  const saved = await recordSubmission("order", {
    status: "pending",
    payment,
    reference,
    customer: data.customer,
    address: data.address,
    items,
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    total: cart.total,
  });
  if (!saved.ok) return apiError(503, SAVE_FAILED_MESSAGE);

  if (payment === "whatsapp") {
    return apiOk<MerchCheckoutResponse>({ mode: "whatsapp", url: whatsappOrderLink(reference, cart), reference });
  }

  try {
    const order = await createOrder({
      amountPaise: toPaise(cart.total),
      receipt: reference,
      notes: sanitizeNotes({
        kind: "merch",
        ref: reference,
        items: compactItems(cart),
        name: data.customer.name,
        phone: data.customer.phone,
        pin: data.address.pin,
      }),
    });
    const session: CheckoutSession = {
      keyId: publicKeyId(),
      orderId: order.id,
      amount: order.amount,
      currency: "INR",
      name: site.brand,
      description: `Merch order ${reference}`,
      prefill: { name: data.customer.name, email: data.customer.email, contact: data.customer.phone },
    };
    return apiOk<MerchCheckoutResponse>({ mode: "razorpay", session, reference });
  } catch (err) {
    console.error("[checkout/merch] Razorpay order creation failed", err);
    return apiError(
      502,
      `The payment window couldn't be opened just now. Your order ${reference} is saved: try again in a minute, or message us on WhatsApp with that reference.`,
    );
  }
}
