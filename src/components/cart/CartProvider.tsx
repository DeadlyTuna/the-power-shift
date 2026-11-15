"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, shippingFor } from "@/content/merch";

/**
 * Shopping cart state, persisted to localStorage per browser.
 * Lines only store slug / variant / quantity; prices always come from the
 * catalog, and the server recomputes everything at checkout.
 */

export type CartLine = { slug: string; variant?: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  /** False until localStorage has been read, so the UI can avoid flashing "empty". */
  ready: boolean;
  count: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  add: (slug: string, variant?: string, qty?: number) => void;
  setQty: (slug: string, variant: string | undefined, qty: number) => void;
  remove: (slug: string, variant?: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "tps-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

const sameLine = (a: CartLine, slug: string, variant?: string) => a.slug === slug && (a.variant ?? "") === (variant ?? "");

function clampQty(slug: string, qty: number) {
  const max = getProduct(slug)?.maxQty ?? 10;
  return Math.max(0, Math.min(max, Math.floor(qty)));
}

function sanitize(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l): l is CartLine => typeof l?.slug === "string" && typeof l?.qty === "number")
    .filter((l) => {
      const product = getProduct(l.slug);
      if (!product || !product.inStock) return false;
      if (product.variants) return product.variants.options.includes(l.variant ?? "");
      return true;
    })
    .map((l) => ({ slug: l.slug, variant: l.variant || undefined, qty: clampQty(l.slug, l.qty) }))
    .filter((l) => l.qty > 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage after mount
      if (stored) setLines(sanitize(JSON.parse(stored)));
    } catch {
      // Storage unavailable (private mode, blocked): the cart still works for this visit.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Ignore storage failures.
    }
  }, [lines, ready]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setLines(sanitize(e.newValue ? JSON.parse(e.newValue) : []));
      } catch {
        setLines([]);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((slug: string, variant?: string, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => sameLine(l, slug, variant));
      if (existing) {
        return prev.map((l) => (sameLine(l, slug, variant) ? { ...l, qty: clampQty(slug, l.qty + qty) } : l));
      }
      const next = clampQty(slug, qty);
      return next > 0 ? [...prev, { slug, variant, qty: next }] : prev;
    });
  }, []);

  const setQty = useCallback((slug: string, variant: string | undefined, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (sameLine(l, slug, variant) ? { ...l, qty: clampQty(slug, qty) } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const remove = useCallback((slug: string, variant?: string) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, slug, variant)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, l) => sum + (getProduct(l.slug)?.price ?? 0) * l.qty, 0);
    const shippingFee = shippingFor(subtotal);
    return {
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      add,
      setQty,
      remove,
      clear,
    };
  }, [lines, ready, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
