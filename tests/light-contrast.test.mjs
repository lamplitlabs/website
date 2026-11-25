// Light-theme contrast guard (TASK-084 part 2, see
// docs/features/light-theme-contrast-and-product-nav.md). The accessible
// light-theme amber and muted text once lived only under `.immersive-home`,
// so product, privacy and 404 pages fell back to an amber that measured 2.4:1
// for white CTA text. This test reads the :root and .dark tokens from
// app/globals.css and checks that the text pairs the site uses meet WCAG AA
// (4.5:1), and that small mono labels are not faded again with an opacity modifier.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const css = readFileSync(resolve(root, "app/globals.css"), "utf8");

function tokens(selector) {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `expected a ${selector} block in app/globals.css`);
  const body = css.slice(start, css.indexOf("}", start));
  const out = {};
  for (const m of body.matchAll(/--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g)) {
    out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
}

function hslToRgb([h, s, l]) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

function luminance(hsl) {
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = hslToRgb(hsl).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs = [
  ["primary-foreground", "primary", "button text on a primary CTA"],
  ["primary", "background", "primary-coloured text and links"],
  ["muted-foreground", "background", "muted body text and labels"],
  ["muted-foreground", "muted", "muted text on muted surfaces"],
  ["foreground", "background", "body text"],
];

for (const theme of [":root", ".dark"]) {
  test(`${theme} colour tokens meet WCAG AA (4.5:1) for text`, () => {
    const t = tokens(theme);
    for (const [fg, bg, use] of pairs) {
      assert.ok(t[fg] && t[bg], `${theme} must define --${fg} and --${bg}`);
      const ratio = contrast(t[fg], t[bg]);
      assert.ok(ratio >= 4.5, `${theme} --${fg} on --${bg} (${use}) is ${ratio.toFixed(2)}:1, below 4.5:1`);
    }
  });
}

test("light-theme tokens are not scoped to the home page only", () => {
  assert.doesNotMatch(
    css,
    /\.immersive-home\s*\{[^}]*--(primary|muted-foreground)\s*:/,
    "light --primary/--muted-foreground must live in :root so every page gets the accessible values",
  );
});

test("small mono labels are not faded with an opacity modifier", () => {
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".tsx")) {
        const src = readFileSync(path, "utf8");
        for (const m of src.matchAll(/className="([^"]*\bmono-label\b[^"]*)"/g)) {
          if (/\btext-(muted-foreground|primary)\/\d+/.test(m[1])) {
            offenders.push(`${path.slice(root.length + 1)}: ${m[1]}`);
          }
        }
      }
    }
  };
  walk(resolve(root, "components"));
  walk(resolve(root, "app"));
  assert.deepEqual(offenders, [], "11px mono labels need the full text colour to stay above 4.5:1");
});
