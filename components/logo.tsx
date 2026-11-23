import { useId } from "react";

export function Logo({
  className,
  lit = true,
  onClick,
}: {
  className?: string;
  lit?: boolean;
  onClick?: () => void;
}) {
  // useId emits colons (":r0:"), which some browsers reject inside url(#...)
  const gradientId = `logo-glow-${useId().replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className ?? ""} transition-all duration-500 ${lit ? "lamp-glow-static" : ""} ${onClick ? "cursor-pointer" : ""}`}
      fill="none"
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <defs>
        <radialGradient id={gradientId} cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="hsl(44, 95%, 64%)" />
          <stop offset="55%" stopColor="hsl(38, 90%, 56%)" />
          <stop offset="100%" stopColor="hsl(31, 92%, 47%)" />
        </radialGradient>
      </defs>

      <rect width="100" height="100" rx="22" fill="#0a0a0f" />

      {/* Glowing disc */}
      <circle
        cx="50"
        cy="50"
        r="33"
        fill={`url(#${gradientId})`}
        opacity={lit ? 1 : 0.55}
        className="transition-opacity duration-500"
      />

      {/* Negative-space L */}
      <path
        d="M42 31 h10 a2 2 0 0 1 2 2 v24 h13 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 h-25 a2 2 0 0 1 -2 -2 v-34 a2 2 0 0 1 2 -2 Z"
        fill="#0a0a0f"
      />
    </svg>
  );
}
