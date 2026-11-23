"use client";

import { useReveal } from "@/hooks/use-reveal";

export function RevealSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const { ref, visible } = useReveal(0.12);

  return (
    <div
      ref={ref}
      id={id}
      className={`reveal ${visible ? "visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
