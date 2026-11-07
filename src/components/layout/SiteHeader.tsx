"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { primaryNav, site, whatsappLink } from "@/content/site";
import { useCart } from "@/components/cart/CartProvider";
import { HeaderAccount, MobileAccountRow } from "@/components/account/HeaderAccount";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

/** Width at which the full navigation replaces the menu button (Tailwind's xl). */
const DESKTOP_NAV_MIN_WIDTH = 1280;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CartLink({ className }: { className?: string }) {
  const { count, ready } = useCart();
  const label = ready && count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart";
  return (
    <Link
      href="/cart"
      aria-label={label}
      className={cn(
        "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-jamun-900 transition-colors hover:bg-mist",
        className,
      )}
    >
      <ShoppingBag aria-hidden="true" className="size-[1.375rem]" />
      <AnimatePresence>
        {ready && count > 0 ? (
          <motion.span
            key="count"
            aria-hidden="true"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 26 }}
            className="absolute top-1 right-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-marigold-400 px-1 text-xs leading-5 font-bold text-jamun-950"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </Link>
  );
}

const menuList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.06 } },
};

const menuItem: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [panelTop, setPanelTop] = useState(72);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  const reduceMotion = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 170, damping: 32, restDelta: 0.001 });

  // Close the menu when the route changes (adjusting state during render, not in an effect).
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  // Shrink after a little scrolling; the gap between thresholds stops flicker at the boundary.
  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled((was) => (was ? y > 8 : y > 32));
  });

  function toggleMenu() {
    if (!open) setPanelTop(Math.round(bar.current?.getBoundingClientRect().bottom ?? 72));
    setOpen((v) => !v);
  }

  // Lock scroll, close on Escape, keep focus inside the menu (and its button), close if the window grows to desktop.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (e.key === "Tab" && panel.current) {
        const focusables = [
          ...(menuButton.current ? [menuButton.current] : []),
          ...panel.current.querySelectorAll<HTMLElement>("a, button"),
        ];
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };
    const onResize = () => {
      if (window.innerWidth >= DESKTOP_NAV_MIN_WIDTH) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const compact = scrolled && !open;

  return (
    // The header keeps a constant height in the page flow; only the bar inside shrinks, so content never jumps.
    <header data-print="hide" className="pointer-events-none sticky top-0 z-40 h-[4.5rem]">
      <a
        href="#main"
        className="pointer-events-auto sr-only z-50 rounded-full bg-jamun-900 px-4 py-2 font-semibold text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div
        ref={bar}
        className={cn(
          "pointer-events-auto relative border-b transition-[height,background-color,border-color,box-shadow] duration-300 ease-shift",
          compact
            ? "h-16 border-line bg-paper/90 shadow-[0_12px_32px_-22px_rgba(42,22,54,0.45)] backdrop-blur-md"
            : "h-[4.5rem]",
          !compact && (open ? "border-line bg-paper" : "border-transparent bg-paper"),
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between gap-3 px-5 sm:px-8">
          <Logo className="shrink-0" />

          <nav aria-label="Main" className="hidden xl:block" onMouseLeave={() => setHovered(null)}>
            <LayoutGroup id="main-nav">
              <ul className="flex items-center gap-1">
                {primaryNav.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onMouseEnter={() => setHovered(item.href)}
                        onFocus={() => setHovered(item.href)}
                        onBlur={() => setHovered(null)}
                        className={cn(
                          "relative isolate inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.9875rem] font-medium whitespace-nowrap transition-colors",
                          active ? "text-jamun-900" : "text-ink hover:text-jamun-900",
                        )}
                      >
                        <AnimatePresence>
                          {hovered === item.href ? (
                            <motion.span
                              key="hover"
                              layoutId="nav-hover"
                              aria-hidden="true"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ type: "spring", stiffness: 480, damping: 38 }}
                              className="absolute inset-0 -z-10 rounded-full bg-mist"
                            />
                          ) : null}
                        </AnimatePresence>
                        {item.label}
                        {item.href === "/assessment" ? (
                          <span className="rounded-full bg-peacock-50 px-1.5 py-0.5 text-[0.6875rem] leading-none font-bold tracking-wide text-peacock-700 uppercase">
                            Free
                          </span>
                        ) : null}
                        {active ? (
                          <motion.span
                            layoutId="nav-active"
                            aria-hidden="true"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-marigold-400"
                          />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </LayoutGroup>
          </nav>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
            <CartLink />
            <HeaderAccount />
            <ButtonLink
              href="/book"
              variant="dark"
              size="sm"
              className="ml-1 hidden whitespace-nowrap sm:inline-flex"
            >
              Book a clarity call
            </ButtonLink>
            <motion.button
              ref={menuButton}
              type="button"
              whileTap={{ scale: 0.9 }}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-jamun-900 transition-colors hover:bg-mist xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={toggleMenu}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={open ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex"
                >
                  {open ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Reading progress along the bottom edge of the header. */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: reduceMotion ? scrollYProgress : smoothProgress }}
          className={cn(
            "absolute inset-x-0 -bottom-px h-0.5 origin-left bg-marigold-400 transition-opacity duration-300",
            open && "opacity-0",
          )}
        />
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            ref={panel}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ top: panelTop }}
            className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-paper xl:hidden"
            onClick={(e) => {
              // Close after choosing a link, including one to the page we're already on.
              if (e.target instanceof Element && e.target.closest("a")) setOpen(false);
            }}
          >
            <nav aria-label="Mobile" className="mx-auto flex max-w-[1200px] flex-col px-5 pt-4 pb-10 sm:px-8">
              <motion.ul variants={menuList} initial="hidden" animate="show" className="flex flex-col">
                {[{ label: "Home", href: "/" }, ...primaryNav].map((item) => {
                  const current = item.href === "/" ? pathname === "/" : isActive(pathname, item.href);
                  return (
                    <motion.li key={item.href} variants={menuItem} className="border-b border-line">
                      <Link
                        href={item.href}
                        aria-current={current ? "page" : undefined}
                        className="group flex items-center justify-between gap-3 py-4 font-display text-[1.75rem] text-jamun-900"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className={cn(
                              "h-6 w-1 rounded-full transition-colors",
                              current ? "bg-marigold-400" : "bg-transparent group-hover:bg-jamun-200",
                            )}
                          />
                          {item.label}
                        </span>
                        {item.href === "/assessment" ? (
                          <span className="rounded-full bg-peacock-50 px-2 py-1 font-sans text-xs font-bold tracking-wide text-peacock-700 uppercase">
                            Free · 3 min
                          </span>
                        ) : null}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>
              <motion.div variants={menuItem} initial="hidden" animate="show" className="mt-6">
                <MobileAccountRow />
              </motion.div>
              <motion.div
                variants={menuItem}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.12 }}
                className="mt-6 flex flex-col gap-3"
              >
                <ButtonLink href="/book" variant="dark" size="lg" arrow>
                  Book a clarity call
                </ButtonLink>
                <ButtonLink href={whatsappLink()} variant="outline" size="lg" icon={<WhatsAppIcon />}>
                  WhatsApp {site.coach.split(" ")[0]}
                </ButtonLink>
              </motion.div>
              <p className="mt-8 text-[0.9375rem] text-muted">
                {site.contact.phoneDisplay} · {site.contact.email}
              </p>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
