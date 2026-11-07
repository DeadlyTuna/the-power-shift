"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";

/**
 * Empties the cart once it has loaded from storage. Waiting for `ready`
 * matters: clearing earlier would be overwritten when the saved cart loads.
 */
export function ClearCartOnMount() {
  const { ready, clear } = useCart();
  const done = useRef(false);

  useEffect(() => {
    if (!ready || done.current) return;
    done.current = true;
    clear();
  }, [ready, clear]);

  return null;
}
