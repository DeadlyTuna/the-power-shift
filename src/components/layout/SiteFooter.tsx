import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { communityLink, footerNav, site, whatsappLink } from "@/content/site";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { FacebookIcon, InstagramIcon, LinkedInIcon, WhatsAppIcon, YouTubeIcon } from "@/components/ui/icons";
import { Logo } from "./Logo";

const socialIcons = {
  linkedin: { label: "LinkedIn", Icon: LinkedInIcon },
  instagram: { label: "Instagram", Icon: InstagramIcon },
  youtube: { label: "YouTube", Icon: YouTubeIcon },
  facebook: { label: "Facebook", Icon: FacebookIcon },
} as const;

/** The brand column and the three link columns stagger in the first time the footer is reached. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const socials = (Object.keys(socialIcons) as (keyof typeof socialIcons)[]).filter((k) => site.social[k]);
  const community = communityLink();

  return (
    <footer data-tone="jamun" data-print="hide" className="bg-jamun-950 text-jamun-200">
      <div className="mx-auto w-full max-w-[1200px] px-5 pt-20 pb-24 sm:px-8">
        <Stagger
          stagger={0.1}
          amount={0.2}
          className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.1fr_1.9fr]"
        >
          <StaggerItem>
            <Logo tone="dark" />
            <p className="mt-8 max-w-sm font-display text-[2rem] leading-[1.1] text-white">{site.tagline}</p>
            <p className="mt-4 max-w-sm text-[0.9875rem]">
              Leadership and life coaching for professionals and organisations ready to step into their power.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={community.href} variant="primary" size="sm" icon={<WhatsAppIcon />}>
                {community.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </ButtonLink>
            </div>
          </StaggerItem>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerNav.map((group) => (
              <StaggerItem key={group.heading}>
                <nav aria-label={group.heading}>
                  <h2 className="eyebrow text-[0.75rem] text-marigold-300">{group.heading}</h2>
                  <ul className="mt-3 flex flex-col">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="inline-flex min-h-11 items-center text-[0.9875rem] text-jamun-100 underline-offset-4 transition-colors hover:text-white hover:underline"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </StaggerItem>
            ))}
          </div>
        </Stagger>

        <div className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-col text-[0.9875rem] sm:flex-row sm:flex-wrap sm:gap-x-8">
            <li>
              <a
                href={`tel:${site.contact.phoneE164}`}
                className="inline-flex min-h-11 items-center gap-2 hover:text-white"
              >
                <Phone aria-hidden="true" className="size-4 text-marigold-300" />
                {site.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-flex min-h-11 items-center gap-2 hover:text-white"
              >
                <Mail aria-hidden="true" className="size-4 text-marigold-300" />
                {site.contact.email}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 hover:text-white"
              >
                <WhatsAppIcon className="size-4 text-marigold-300" />
                WhatsApp
              </a>
            </li>
          </ul>
          {socials.length ? (
            <ul className="flex gap-2">
              {socials.map((key) => {
                const { label, Icon } = socialIcons[key];
                return (
                  <li key={key}>
                    <a
                      href={site.social[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 text-jamun-100 transition-colors hover:border-white hover:text-white"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-jamun-200/80 md:flex-row md:justify-between">
          <p>
            © {year} {site.coach} · {site.domain}
          </p>
          <p className="max-w-xl md:text-right">
            This site is not affiliated with Facebook™ or Meta™. Results shared are from real participants and are not
            guaranteed; individual results vary.
          </p>
        </div>
      </div>
    </footer>
  );
}
