"use client";

/**
 * Animated SVG illustration for the Lamplit Labs brand story.
 * Shows a lamp illuminating ideas/tools, adapts to light/dark themes.
 */
export function LamplitIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
    >
      {/* Background grid dots */}
      <g opacity="0.04">
        {Array.from({ length: 12 }).map((_, row) =>
          Array.from({ length: 16 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={30 + col * 28}
              cy={20 + row * 28}
              r="1"
              fill="currentColor"
            />
          ))
        )}
      </g>

      {/* Light cone from lamp */}
      <path
        d="M240 80 L140 280 L340 280 Z"
        fill="url(#lampGlow)"
        opacity="0.12"
      />

      {/* Lamp body */}
      <g transform="translate(210, 30)">
        {/* Shade */}
        <path
          d="M0 40 Q0 20 30 10 Q60 20 60 40 L55 50 L5 50 Z"
          fill="currentColor"
          opacity="0.15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
        {/* Post */}
        <rect x="27" y="50" width="6" height="15" rx="1" fill="currentColor" opacity="0.4" />
        {/* Bulb */}
        <circle cx="30" cy="46" r="4" fill="hsl(38, 85%, 55%)" opacity="0.6" />
        {/* Rays */}
        <g stroke="hsl(38, 85%, 55%)" strokeWidth="1" strokeLinecap="round" opacity="0.3">
          <line x1="30" y1="38" x2="30" y2="32" />
          <line x1="22" y1="42" x2="16" y2="38" />
          <line x1="38" y1="42" x2="44" y2="38" />
          <line x1="20" y1="48" x2="12" y2="48" />
          <line x1="40" y1="48" x2="48" y2="48" />
        </g>
      </g>

      {/* Illuminated items in the light cone */}
      {[
        { label: "visual AI agents", x: 145, y: 125 },
        { label: "education", x: 165, y: 165 },
        { label: "developer tools", x: 270, y: 165 },
        { label: "career", x: 170, y: 210 },
        { label: "medical prep", x: 250, y: 210 },
        { label: "compliance", x: 215, y: 250 },
      ].map((item) => (
        <g key={item.label} transform={`translate(${item.x}, ${item.y})`}>
          <rect
            width={item.label.length * 8 + 20}
            height="28"
            rx="14"
            fill="currentColor"
            opacity="0.06"
            stroke="hsl(38, 85%, 55%)"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
          <text
            x={(item.label.length * 8 + 20) / 2}
            y="18"
            textAnchor="middle"
            fontSize="11"
            fontFamily="sans-serif"
            fill="currentColor"
            opacity="0.5"
          >
            {item.label}
          </text>
        </g>
      ))}

      {/* Gradient definition */}
      <defs>
        <radialGradient id="lampGlow" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="hsl(38, 85%, 55%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(38, 85%, 55%)" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
