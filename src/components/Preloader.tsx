"use client";

import { useState, useEffect } from "react";

const SESSION_KEY = "cava-preloader-shown";
const HOLD_MS     = 1600; // visible duration before fade starts
const FADE_MS     = 700;  // must match duration-700

export function Preloader() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inDom,     setInDom]     = useState(true); // removed after fade completes

  useEffect(() => {
    // Step 1 — mark as mounted so we can safely touch browser APIs
    setIsMounted(true);

    // Step 2 — skip entirely if already shown this session
    if (sessionStorage.getItem(SESSION_KEY)) {
      setIsLoading(false);
      setInDom(false);
      return;
    }

    // Step 3 — start fade-out after hold period
    const t1 = setTimeout(() => setIsLoading(false), HOLD_MS);

    // Step 4 — remove from DOM after fade finishes, save flag
    const t2 = setTimeout(() => {
      setInDom(false);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, HOLD_MS + FADE_MS);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Render nothing on the server and on the first client paint
  // to guarantee the server/client HTML trees match exactly.
  if (!isMounted || !inDom) return null;

  return (
    <div
      aria-hidden="true"
      className={[
        "fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFBF7]",
        "transition-opacity duration-700 ease-in-out",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <div className="flex flex-col items-center gap-2">

        {/* logo */}
        <span
          className="font-heading text-5xl font-semibold tracking-wide text-[#2C1E16]"
          style={{ animation: "cava-rise 0.85s ease-out both" }}
        >
          Cava Bar
        </span>

        {/* subtitle */}
        <span
          className="text-[11px] uppercase tracking-[0.3em] text-[#C68E58]"
          style={{ animation: "cava-rise 0.85s 0.18s ease-out both" }}
        >
          кав&apos;ярня · м. Броди
        </span>

        {/* decorative accent line */}
        <span
          className="block h-px w-10 bg-[#C68E58]/60 mt-1 origin-center"
          style={{ animation: "cava-grow 0.6s 0.45s ease-out both" }}
        />

      </div>
    </div>
  );
}
