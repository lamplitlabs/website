// Guards the lint toolchain after Dependabot #175 moved every minimatch copy to v11
// (package.json "overrides": {"minimatch": "11.0.3"}). ESLint 8 and its plugins were
// written for minimatch 3. v11 has no default export (dropped in v9) and matches globs
// with a new engine. So:
//   1. ESLint's config globs must still pick the right parser per file type.
//   2. No rule the project enables may load minimatch. eslint-plugin-react and
//      eslint-plugin-jsx-a11y call `minimatch(...)` as a function, which throws
//      "minimatch is not a function" on v11. It only throws when the rule reaches that
//      code path, so `npm run lint` can pass today and crash on a later file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const require = createRequire(resolve(root, "package.json"));
const { ESLint } = require("eslint");
const eslint = new ESLint({ cwd: root });

test("minimatch 11 keeps ESLint's TypeScript override glob (**/*.ts?(x)) working", async () => {
  const parserOf = async (file) => {
    const { parser } = await eslint.calculateConfigForFile(resolve(root, file));
    return parser.split(sep).join("/");
  };
  for (const file of ["app/page.tsx", "lib/site-data.ts"]) {
    assert.match(await parserOf(file), /\/@typescript-eslint\/parser\//, `${file} parsed as TypeScript`);
  }
  assert.match(await parserOf("next.config.js"), /\/eslint-config-next\/parser\.js$/, "JS keeps Next's parser");
});

test("no ESLint rule the project enables loads minimatch (v11 has no default export)", async () => {
  const enabled = new Set();
  for (const file of ["app/page.tsx", "lib/site-data.ts", "next.config.js"]) {
    const { rules } = await eslint.calculateConfigForFile(resolve(root, file));
    for (const [id, setting] of Object.entries(rules)) {
      const level = Array.isArray(setting) ? setting[0] : setting;
      if (level !== "off" && level !== 0 && id.includes("/")) enabled.add(id);
    }
  }
  assert.ok(enabled.size > 10, `expected the Next.js plugin rules to be enabled, got ${enabled.size}`);

  const isMinimatch = (mod) => /[\\/]node_modules[\\/]minimatch[\\/]/.test(mod.filename);
  const reachesMinimatch = (mod, seen = new Set()) => {
    if (!mod || seen.has(mod)) return false;
    seen.add(mod);
    return isMinimatch(mod) || mod.children.some((child) => reachesMinimatch(child, seen));
  };
  const moduleOf = (rule) =>
    Object.values(require.cache).find((mod) => mod.exports === rule || mod.exports?.default === rule);
  // ESLint's plugin naming: "react" -> eslint-plugin-react, "@next/next" -> @next/eslint-plugin-next.
  const pluginPackage = (prefix) => {
    if (!prefix.startsWith("@")) return `eslint-plugin-${prefix}`;
    const [scope, name] = prefix.split("/");
    return name ? `${scope}/eslint-plugin-${name}` : `${scope}/eslint-plugin`;
  };

  const offenders = [];
  for (const id of enabled) {
    const slash = id.lastIndexOf("/");
    const pkg = pluginPackage(id.slice(0, slash));
    const rule = require(pkg).rules[id.slice(slash + 1)];
    assert.ok(rule, `rule ${id} exists`);
    // A bundled plugin (react-hooks) has no module per rule: check the whole bundle instead.
    const mod = moduleOf(rule) ?? require.cache[require.resolve(pkg)];
    if (reachesMinimatch(mod)) offenders.push(id);
  }
  assert.deepEqual(offenders, [], "these rules call minimatch, which breaks on v11");

  // Self-check that the walk can see minimatch: this rule calls minimatch() and stays off.
  const pascalCase = require("eslint-plugin-react").rules["jsx-pascal-case"];
  assert.ok(reachesMinimatch(moduleOf(pascalCase)), "detector finds react/jsx-pascal-case's minimatch import");
});
