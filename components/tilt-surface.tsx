"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./tilt-surface.module.css";

export interface TiltSurfaceProps {
  children: ReactNode;
  /** Layout and reveal styles belong on the stationary outer wrapper. */
  className?: string;
  surfaceClassName?: string;
  disabled?: boolean;
  /** Maximum rotation in degrees: defaults to 4, capped at 8. */
  maxTilt?: number;
  style?: CSSProperties;
}

export function TiltSurface({
  children,
  className,
  surfaceClassName,
  disabled = false,
  maxTilt = 4,
  style,
}: TiltSurfaceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  if (!Number.isFinite(maxTilt) || maxTilt < 0) {
    throw new RangeError(
      "TiltSurface maxTilt must be a finite, non-negative number."
    );
  }

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const surface = surfaceRef.current;
    if (!wrapper || !surface || disabled) return;

    const motionQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );
    const tiltLimit = Math.min(maxTilt, 8);
    let frame: number | null = null;
    let pointer: { x: number; y: number } | null = null;
    let disposed = false;

    function reset() {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
      pointer = null;
      surface?.removeAttribute("data-tilt-active");
      surface?.style.removeProperty("--tilt-rotate-x");
      surface?.style.removeProperty("--tilt-rotate-y");
      surface?.style.removeProperty("--tilt-light-x");
      surface?.style.removeProperty("--tilt-light-y");
    }

    function update() {
      frame = null;
      if (
        disposed ||
        !pointer ||
        !motionQuery.matches ||
        !wrapper ||
        !surface ||
        wrapper.matches(":focus-within")
      ) {
        reset();
        return;
      }

      // Measure the wrapper so the tilted surface cannot feed back into its bounds.
      const bounds = wrapper.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) {
        reset();
        return;
      }
      const x = Math.min(1, Math.max(0, (pointer.x - bounds.left) / bounds.width));
      const y = Math.min(1, Math.max(0, (pointer.y - bounds.top) / bounds.height));

      surface.style.setProperty(
        "--tilt-rotate-x",
        `${((0.5 - y) * 2 * tiltLimit).toFixed(2)}deg`
      );
      surface.style.setProperty(
        "--tilt-rotate-y",
        `${((x - 0.5) * 2 * tiltLimit).toFixed(2)}deg`
      );
      surface.style.setProperty("--tilt-light-x", `${(x * 100).toFixed(2)}%`);
      surface.style.setProperty("--tilt-light-y", `${(y * 100).toFixed(2)}%`);
      surface.setAttribute("data-tilt-active", "");
    }

    function onPointerMove(event: PointerEvent) {
      if (
        !motionQuery.matches ||
        event.pointerType === "touch" ||
        wrapper?.matches(":focus-within")
      ) {
        reset();
        return;
      }
      pointer = { x: event.clientX, y: event.clientY };
      if (frame === null) {
        frame = window.requestAnimationFrame(update);
      }
    }

    wrapper.addEventListener("pointerenter", onPointerMove);
    wrapper.addEventListener("pointermove", onPointerMove);
    wrapper.addEventListener("pointerleave", reset);
    wrapper.addEventListener("pointercancel", reset);
    wrapper.addEventListener("focusin", reset);
    wrapper.addEventListener("focusout", reset);
    motionQuery.addEventListener("change", reset);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);

    return () => {
      disposed = true;
      reset();
      wrapper.removeEventListener("pointerenter", onPointerMove);
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerleave", reset);
      wrapper.removeEventListener("pointercancel", reset);
      wrapper.removeEventListener("focusin", reset);
      wrapper.removeEventListener("focusout", reset);
      motionQuery.removeEventListener("change", reset);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [disabled, maxTilt]);

  return (
    <div ref={wrapperRef} className={cn(styles.wrapper, className)} style={style}>
      <div ref={surfaceRef} className={cn(styles.surface, surfaceClassName)}>
        {children}
      </div>
    </div>
  );
}
