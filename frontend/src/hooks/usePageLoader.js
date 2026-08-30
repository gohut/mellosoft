"use client";

import { useState, useEffect, useRef } from "react";

/**
 * usePageLoader — Controls MellosoftLoader visibility for a page.
 *
 * Returns { showLoader } to pass into <MellosoftLoader show={showLoader} />.
 *
 * Behavior:
 * - Shows loader for `delayMs` (default 120ms) to avoid flash on instant loads.
 * - If mounted within `minDisplayMs` (default 0), loader never shows.
 * - Accepts an optional `ready` condition — loader hides when `ready === true`.
 *
 * @param {object} options
 * @param {boolean} [options.ready=true]       — External ready signal (data loaded).
 * @param {number}  [options.delayMs=120]      — Delay before loader appears (avoids flash).
 * @param {number}  [options.minDisplayMs=400] — Minimum loader display time once shown.
 */
export function usePageLoader({
  ready = true,
  delayMs = 120,
  minDisplayMs = 400
} = {}) {
  const [showLoader, setShowLoader] = useState(false);
  const shownAtRef = useRef(null);
  const delayTimerRef = useRef(null);
  const minTimerRef = useRef(null);

  useEffect(() => {
    if (!ready) {
      // Start delay timer before showing loader
      delayTimerRef.current = setTimeout(() => {
        shownAtRef.current = Date.now();
        setShowLoader(true);
      }, delayMs);
    } else {
      // Content is ready — clear pending show timer
      clearTimeout(delayTimerRef.current);

      if (shownAtRef.current !== null) {
        // Loader was already shown — respect minDisplayMs
        const elapsed = Date.now() - shownAtRef.current;
        const remaining = Math.max(0, minDisplayMs - elapsed);
        minTimerRef.current = setTimeout(() => {
          shownAtRef.current = null;
          setShowLoader(false);
        }, remaining);
      } else {
        // Loader never appeared — nothing to do
        setShowLoader(false);
      }
    }

    return () => {
      clearTimeout(delayTimerRef.current);
      clearTimeout(minTimerRef.current);
    };
  }, [ready, delayMs, minDisplayMs]);

  return { showLoader };
}
