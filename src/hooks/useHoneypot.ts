"use client";

import { useRef, useState } from "react";

const MIN_HUMAN_MS = 1500; // bots submit instantly; humans take >1.5s

export function useHoneypot() {
  const [trap, setTrap] = useState("");
  const mountedAt = useRef(Date.now());

  /* Returns an error string if bot detected, null if human */
  function checkHoneypot(): string | null {
    if (trap !== "") return "Bot detected";
    const elapsed = Date.now() - mountedAt.current;
    if (elapsed < MIN_HUMAN_MS) return "Submitted too quickly";
    return null;
  }

  /* Props spread onto the decoy input */
  const honeypotProps = {
    value: trap,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTrap(e.target.value),
    tabIndex: -1,
    autoComplete: "off",
    "aria-hidden": true as const,
  };

  return { honeypotProps, checkHoneypot };
}
