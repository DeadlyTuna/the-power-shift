import type { ReactNode } from "react";
import { site, whatsappLink } from "@/content/site";

/** Small, reusable pieces of policy text. Styling comes from the surrounding prose (see legalProse). */

export function EmailLink({ subject }: { subject?: string }) {
  const href = `mailto:${site.contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return <a href={href}>{site.contact.email}</a>;
}

export function PhoneLink() {
  return (
    <a href={`tel:${site.contact.phoneE164}`} className="whitespace-nowrap">
      {site.contact.phoneDisplay}
    </a>
  );
}

export function WhatsAppTextLink({ message, children = "WhatsApp" }: { message?: string; children?: ReactNode }) {
  return (
    <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/**
 * Who runs the business and how to reach them. Razorpay checks that this
 * matches the KYC details.
 * TODO(client): set site.legal.address (and gstin, if registered) before
 * applying for live payments; the address line is hidden while it's empty.
 */
export function BusinessDetails() {
  const { entityName, address, gstin } = site.legal;
  return (
    <ul>
      <li>
        <strong>Business:</strong> {site.brand}, run by {entityName}
      </li>
      {address ? (
        <li>
          <strong>Address:</strong> {address}
        </li>
      ) : null}
      {gstin ? (
        <li>
          <strong>GSTIN:</strong> {gstin}
        </li>
      ) : null}
      <li>
        <strong>Email:</strong> <EmailLink />
      </li>
      <li>
        <strong>Phone and WhatsApp:</strong> <PhoneLink />
      </li>
      <li>
        <strong>Hours:</strong> {site.contact.hours}
      </li>
    </ul>
  );
}
