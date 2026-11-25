"use client";

import { useRef, useState } from "react";

/**
 * Pendant-lamp theme toggle. Light mode = lamp on (beam visible),
 * dark mode = lamp off. Users pull the cord to switch.
 *
 * Easter egg: yank the cord six times in a few seconds and the
 * bulb "overheats" — it flickers and complains before recovering.
 */
export function LampToggle({
  theme,
  setTheme,
}: {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}) {
  const [pulling, setPulling] = useState(false);
  const [overheated, setOverheated] = useState(false);
  const pullTimes = useRef<number[]>([]);
  const lit = theme !== "dark";

  const handlePull = () => {
    setPulling(true);
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => setPulling(false), 500);

    const now = Date.now();
    pullTimes.current = [...pullTimes.current.filter((t) => now - t < 4000), now];
    if (pullTimes.current.length >= 6 && !overheated) {
      pullTimes.current = [];
      setOverheated(true);
      setTimeout(() => setOverheated(false), 3200);
    }
  };

  return (
    <button
      onClick={handlePull}
      className="group relative flex h-10 w-9 items-start justify-center overflow-visible"
      aria-label={lit ? "Turn off the light" : "Turn on the light"}
      title={lit ? "Turn off the light" : "Turn on the light"}
    >
      <svg
        viewBox="0 0 36 40"
        className={`h-10 w-9 transition-all duration-500 ${lit ? "lamp-glow-static" : ""} ${overheated ? "bulb-flicker" : ""}`}
        fill="none"
      >
        {/* Ceiling cord */}
        <line
          x1="18"
          y1="0"
          x2="18"
          y2="5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Beam cone — only when lit */}
        <path
          d="M13.5 15 L8 36 H28 L22.5 15 Z"
          fill="hsl(40, 92%, 60%)"
          opacity={lit ? 0.35 : 0}
          className="transition-opacity duration-500"
        />

        {/* Pendant shade */}
        <path
          d="M10.5 12.5 a7.5 7.5 0 0 1 15 0 v1 a1 1 0 0 1 -1 1 h-13 a1 1 0 0 1 -1 -1 Z"
          fill="currentColor"
        />

        {/* Filament */}
        <circle
          cx="18"
          cy="16.5"
          r="2.4"
          fill={lit ? "hsl(40, 92%, 60%)" : "currentColor"}
          opacity={lit ? 1 : 0.3}
          className="transition-all duration-500"
        />
      </svg>

      {/* Pull cord — cord-pull/cord-sway keyframes include translateX(-50%),
          so `left` marks the cord's center line */}
      <div
        className={`absolute left-[24px] top-[14px] ${pulling ? "cord-pull" : "cord-sway"}`}
      >
        <svg
          width="8"
          height="22"
          viewBox="0 0 8 22"
          className="transition-transform duration-300 group-hover:translate-y-1"
        >
          <path
            d="M4 0 Q3 6 4 11 Q5 15 4 18"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
            className="transition-opacity duration-300 group-hover:opacity-60"
          />
          <circle
            cx="4"
            cy="19"
            r="2.2"
            fill="currentColor"
            opacity="0.35"
            className="transition-opacity duration-300 group-hover:opacity-55"
          />
        </svg>
      </div>

      {overheated && (
        <span
          role="status"
          className="mobile-menu-enter absolute right-0 top-full z-50 mt-3 whitespace-nowrap rounded-md border bg-background px-2.5 py-1.5 text-xs text-muted-foreground shadow-md"
        >
          Easy there &mdash; you&apos;ll burn out the bulb.
        </span>
      )}
    </button>
  );
}
