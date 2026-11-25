"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const CONSOLE_ART = `
        ___
      .'   '.
     /  .-.  \\      Lamplit Labs
     |  (o)  |      You found the workshop lights.
      \\     /
       '---'        Psst - type "lumos" or "nox"
        |||         anywhere on the page.
      __|||__
`;

declare global {
  interface Window {
    __lamplitGreeted?: boolean;
  }
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable
  );
}

/**
 * Home-page easter eggs:
 * - console greeting for the devs who look
 * - "lumos" / "nox" typed anywhere switches the lights
 */
export function EasterEggs() {
  const { setTheme } = useTheme();
  const [burst, setBurst] = useState<"lumos" | "nox" | null>(null);

  useEffect(() => {
    if (window.__lamplitGreeted) return;
    window.__lamplitGreeted = true;
    // eslint-disable-next-line no-console
    console.log(
      `%c${CONSOLE_ART}`,
      "color: hsl(38, 85%, 55%); font-family: monospace;",
    );
    // eslint-disable-next-line no-console
    console.log(
      "%cWe build practical tools for real problems. Curious how? https://github.com/lamplitlabs",
      "color: gray;",
    );
  }, []);

  useEffect(() => {
    let buffer = "";
    let clearBurst: ReturnType<typeof setTimeout> | undefined;

    const cast = (spell: "lumos" | "nox") => {
      setTheme(spell === "lumos" ? "light" : "dark");
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reducedMotion) return;
      setBurst(spell);
      clearTimeout(clearBurst);
      clearBurst = setTimeout(() => setBurst(null), 1100);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.key.length !== 1) return;
      buffer = (buffer + event.key.toLowerCase()).slice(-8);
      if (buffer.endsWith("lumos")) {
        buffer = "";
        cast("lumos");
      } else if (buffer.endsWith("nox")) {
        buffer = "";
        cast("nox");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(clearBurst);
    };
  }, [setTheme]);

  if (!burst) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[100] ${
        burst === "lumos" ? "spell-lumos" : "spell-nox"
      }`}
    />
  );
}
