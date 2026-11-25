"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import styles from "@/components/home/hero-scene.module.css";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Orbit {
  radius: number;
  tilt: number;
  roll: number;
}

const TAU = Math.PI * 2;
const ORBITS: Orbit[] = [
  { radius: 1.34, tilt: 0.3, roll: 0.22 },
  { radius: 1.16, tilt: 1.06, roll: -0.65 },
];

function surfacePoint(latitude: number, longitude: number): Point3D {
  return {
    x: Math.cos(latitude) * Math.cos(longitude),
    y: Math.sin(latitude),
    z: Math.cos(latitude) * Math.sin(longitude),
  };
}

function orbitPoint(orbit: Orbit, angle: number): Point3D {
  const x = Math.cos(angle) * orbit.radius;
  const y = -Math.sin(angle) * Math.sin(orbit.tilt) * orbit.radius;
  return {
    x: x * Math.cos(orbit.roll) - y * Math.sin(orbit.roll),
    y: x * Math.sin(orbit.roll) + y * Math.cos(orbit.roll),
    z: Math.sin(angle) * Math.cos(orbit.tilt) * orbit.radius,
  };
}

function createGeometry(compact: boolean) {
  const steps = compact ? 48 : 72;
  const meridians = compact ? 10 : 16;
  const lines: Point3D[][] = [];

  for (let latitude = -60; latitude <= 60; latitude += 30) {
    lines.push(Array.from({ length: steps + 1 }, (_, index) =>
      surfacePoint(latitude * Math.PI / 180, index / steps * TAU),
    ));
  }

  for (let longitude = 0; longitude < meridians; longitude++) {
    lines.push(Array.from({ length: steps + 1 }, (_, index) =>
      surfacePoint((index / steps - 0.5) * Math.PI, longitude / meridians * TAU),
    ));
  }

  const count = compact ? 40 : 72;
  const particles = Array.from({ length: count }, (_, index) =>
    surfacePoint(Math.asin(1 - 2 * (index + 0.5) / count), index * 2.399963),
  );
  const orbits = ORBITS.map((orbit) =>
    Array.from({ length: steps * 2 + 1 }, (_, index) =>
      orbitPoint(orbit, index / (steps * 2) * TAU),
    ),
  );

  return { lines, particles, orbits };
}

function projector(cx: number, cy: number, radius: number, yaw: number, pitch: number) {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const cosRoll = Math.cos(-0.2);
  const sinRoll = Math.sin(-0.2);

  return (point: Point3D): Point3D => {
    const x = point.x * cosYaw + point.z * sinYaw;
    const depth = -point.x * sinYaw + point.z * cosYaw;
    const y = point.y * cosPitch - depth * sinPitch;
    return {
      x: cx + (x * cosRoll - y * sinRoll) * radius,
      y: cy - (x * sinRoll + y * cosRoll) * radius,
      z: point.y * sinPitch + depth * cosPitch,
    };
  };
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  geometry: ReturnType<typeof createGeometry>,
  time: number,
  pointer: { x: number; y: number },
  dark: boolean,
) {
  ctx.clearRect(0, 0, width, height);
  const radius = width * 0.325;
  const cx = width * (0.5 + pointer.x * 0.009);
  const cy = height * (0.43 + pointer.y * 0.008) + Math.sin(time * 0.6) * radius * 0.012;
  const pitch = 0.2 + pointer.y * 0.08;
  const projectSurface = projector(cx, cy, radius, -0.4 + time * 0.09 + pointer.x * 0.12, pitch);
  const projectOrbit = projector(cx, cy, radius, pointer.x * 0.12, pitch);
  const orbitPaths = geometry.orbits.map((path) => path.map(projectOrbit));
  const satellites = ORBITS.map((orbit, index) =>
    projectOrbit(orbitPoint(orbit, time * (index === 0 ? 0.18 : -0.13) + 0.8 + index * 2.4)),
  ).sort((a, b) => a.z - b.z);

  const metal = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  metal.addColorStop(0, "#fff0c3");
  metal.addColorStop(0.3, "#dca255");
  metal.addColorStop(0.58, "#805028");
  metal.addColorStop(0.8, "#f4c67e");
  metal.addColorStop(1, "#986139");

  // Rear hardware is painted before the opaque sphere; front arcs occlude it.
  function drawOrbits(front: boolean) {
    ctx.save();
    ctx.globalAlpha = front ? 0.95 : 0.42;
    ctx.lineCap = "round";
    for (const path of orbitPaths) {
      ctx.beginPath();
      for (let index = 1; index < path.length; index++) {
        const a = path[index - 1];
        const b = path[index];
        if (((a.z + b.z) / 2 >= 0) !== front) continue;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.lineWidth = front ? 3 : 2;
      ctx.strokeStyle = dark ? "#50351f" : "#795032";
      ctx.stroke();
      ctx.lineWidth = front ? 1.25 : 0.85;
      ctx.strokeStyle = metal;
      ctx.stroke();
    }
    ctx.restore();

    for (const point of satellites) {
      if ((point.z >= 0) !== front) continue;
      const size = Math.max(1.8, width * 0.0055) * (1 + point.z * 0.12);
      ctx.beginPath();
      ctx.arc(point.x, point.y, size * 3.5, 0, TAU);
      ctx.fillStyle = `rgba(239, 175, 77, ${front ? 0.12 : 0.04})`;
      ctx.fill();
      const bead = ctx.createRadialGradient(
        point.x - size * 0.3, point.y - size * 0.4, 0,
        point.x, point.y, size,
      );
      bead.addColorStop(0, "#fff6dc");
      bead.addColorStop(0.4, "#e4b267");
      bead.addColorStop(1, "#785032");
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, TAU);
      ctx.fillStyle = bead;
      ctx.fill();
    }
  }

  drawOrbits(false);

  const sphere = ctx.createRadialGradient(
    cx - radius * 0.4, cy - radius * 0.48, radius * 0.025,
    cx, cy, radius,
  );
  sphere.addColorStop(0, dark ? "#fff0bb" : "#fff4d4");
  sphere.addColorStop(0.18, "#e2b66c");
  sphere.addColorStop(0.4, "#ad763a");
  sphere.addColorStop(0.64, "#644525");
  sphere.addColorStop(0.84, "#302a21");
  sphere.addColorStop(1, dark ? "#13191b" : "#242624");
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.fillStyle = sphere;
  ctx.fill();

  ctx.save();
  ctx.clip();
  const wire = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  wire.addColorStop(0, "rgba(255, 247, 217, 0.72)");
  wire.addColorStop(0.5, "rgba(251, 209, 135, 0.35)");
  wire.addColorStop(1, "rgba(181, 125, 67, 0.16)");
  ctx.strokeStyle = wire;
  ctx.lineWidth = width < 440 ? 0.7 : 0.9;
  ctx.beginPath();
  for (const line of geometry.lines) {
    let previous: Point3D | null = null;
    for (const point of line) {
      const projected = projectSurface(point);
      if (previous && previous.z > 0 && projected.z > 0) {
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(projected.x, projected.y);
      }
      previous = projected;
    }
  }
  ctx.stroke();

  const particles = geometry.particles.map(projectSurface).sort((a, b) => a.z - b.z);
  for (const point of particles) {
    if (point.z <= 0) continue;
    const size = (width < 440 ? 0.7 : 0.9) + point.z * 1.1;
    ctx.beginPath();
    ctx.arc(point.x, point.y, size * 3, 0, TAU);
    ctx.fillStyle = `rgba(255, 192, 99, ${point.z * 0.09})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(point.x, point.y, size, 0, TAU);
    ctx.fillStyle = `rgba(255, 233, 185, ${0.2 + point.z * 0.7})`;
    ctx.fill();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.strokeStyle = metal;
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 1.5, Math.PI * 1.03, Math.PI * 1.67);
  ctx.strokeStyle = "rgba(255, 226, 160, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawOrbits(true);
}

export function HeroGlobe({ className = "" }: { className?: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const sceneElement = sceneRef.current;
    const canvasElement = canvasRef.current;
    if (!sceneElement || !canvasElement) return;
    const context = canvasElement.getContext("2d");
    if (!context) return;
    const scene = sceneElement;
    const canvas = canvasElement;
    const ctx = context;

    const dark = resolvedTheme === "dark"
      || (!resolvedTheme && document.documentElement.classList.contains("dark"));
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pointerSurface = scene.closest("section") ?? scene;
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let frame: number | null = null;
    let lastTime: number | null = null;
    let elapsed = 0;
    let width = 0;
    let height = 0;
    let compact = true;
    let geometry = createGeometry(compact);
    let intersecting = false;
    let contextAvailable = true;
    let disposed = false;
    let pointerListening = false;
    let densityQuery: MediaQueryList | null = null;

    function resetPointer() {
      target.x = 0;
      target.y = 0;
    }

    function movePointer(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const bounds = pointerSurface.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      target.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      target.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    }

    function listenToPointer(enabled: boolean) {
      if (pointerListening === enabled) return;
      pointerListening = enabled;
      if (enabled) {
        pointerSurface.addEventListener("pointermove", movePointer, { passive: true });
        pointerSurface.addEventListener("pointerleave", resetPointer);
      } else {
        pointerSurface.removeEventListener("pointermove", movePointer);
        pointerSurface.removeEventListener("pointerleave", resetPointer);
        resetPointer();
        pointer.x = 0;
        pointer.y = 0;
      }
    }

    function canAnimate() {
      return !disposed && contextAvailable && intersecting && !document.hidden
        && !motionQuery.matches && width > 0 && height > 0;
    }

    function paint() {
      if (disposed || !contextAvailable || document.hidden || width <= 0 || height <= 0) return;
      drawScene(ctx, width, height, geometry, motionQuery.matches ? 0 : elapsed, pointer, dark);
      scene.dataset.ready = "true";
    }

    function stop() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      lastTime = null;
    }

    function tick(now: number) {
      frame = null;
      if (!canAnimate()) return;
      const delta = lastTime === null ? 0 : Math.max(0, Math.min((now - lastTime) / 1000, 0.05));
      lastTime = now;
      elapsed += delta;
      const blend = 1 - Math.exp(-delta * 6);
      pointer.x += (target.x - pointer.x) * blend;
      pointer.y += (target.y - pointer.y) * blend;
      paint();
      frame = requestAnimationFrame(tick);
    }

    // Every lifecycle event reconciles the same single animation loop.
    function sync() {
      stop();
      const animate = canAnimate();
      listenToPointer(animate && pointerQuery.matches);
      paint();
      if (animate) frame = requestAnimationFrame(tick);
    }

    function resize() {
      if (disposed) return;
      const bounds = scene.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const nextCompact = width < 440;
      if (nextCompact !== compact) {
        compact = nextCompact;
        geometry = createGeometry(compact);
      }
      if (width > 0 && height > 0 && contextAvailable) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const pixelWidth = Math.max(1, Math.round(width * dpr));
        const pixelHeight = Math.max(1, Math.round(height * dpr));
        if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
        if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
        ctx.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
      }
      sync();
    }

    function watchDensity() {
      densityQuery?.removeEventListener("change", changeDensity);
      densityQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      densityQuery.addEventListener("change", changeDensity);
    }

    function changeDensity() {
      watchDensity();
      resize();
    }

    function loseContext(event: Event) {
      event.preventDefault();
      contextAvailable = false;
      delete scene.dataset.ready;
      sync();
    }

    function restoreContext() {
      contextAvailable = true;
      resize();
    }

    const intersectionObserver = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(([entry]) => {
        intersecting = entry.isIntersecting;
        sync();
      });
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    intersectionObserver?.observe(scene);
    resizeObserver?.observe(scene);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", sync);
    motionQuery.addEventListener("change", sync);
    pointerQuery.addEventListener("change", sync);
    canvas.addEventListener("contextlost", loseContext);
    canvas.addEventListener("contextrestored", restoreContext);
    watchDensity();
    resize();

    return () => {
      disposed = true;
      stop();
      listenToPointer(false);
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", sync);
      motionQuery.removeEventListener("change", sync);
      pointerQuery.removeEventListener("change", sync);
      densityQuery?.removeEventListener("change", changeDensity);
      canvas.removeEventListener("contextlost", loseContext);
      canvas.removeEventListener("contextrestored", restoreContext);
      delete scene.dataset.ready;
    };
  }, [resolvedTheme]);

  return (
    <div ref={sceneRef} className={`${styles.scene} ${className}`} aria-hidden="true">
      <div className={styles.backlight} />
      <div className={styles.groundGrid} />
      <div className={styles.platform} />
      <div className={styles.fallback}>
        <div className={styles.orbitBack} />
        <div className={styles.fallbackSphere}>
          <span className={styles.fallbackMeridian} />
          <span className={`${styles.fallbackMeridian} ${styles.wideMeridian}`} />
          <span className={styles.fallbackLatitude} />
        </div>
        <div className={styles.orbitFront} />
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
