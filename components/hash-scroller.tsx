"use client";

import { useEffect } from "react";

/**
 * Reads window.location.hash after Next.js hydration and smoothly scrolls
 * to the matching element. Fixes hash-anchor navigation on page refresh.
 */
export function HashScroller() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    // Small delay so the DOM is fully painted before scrolling
    const timer = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 80);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
