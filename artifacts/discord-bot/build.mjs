/**
 * Build script — bundles the Discord bot (including @workspace/db) into
 * a single dist/index.mjs that only requires real npm packages at runtime.
 *
 * Usage:
 *   npm run build     (or: node build.mjs)
 *   npm start         (runs: node dist/index.mjs)
 */

import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Clean dist/
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/index.mjs",

  // These npm packages stay as real dependencies — installed via npm install.
  // Everything else (including @workspace/db) is bundled inline.
  external: [
    "discord.js",
    "cycletls",
    "drizzle-orm",
    "drizzle-orm/*",
    "@node-postgres/*",
    "pg",
    "pg-native",
    "stripe",
    "zod",
  ],

  // Map workspace packages to their source on disk.
  alias: {
    "@workspace/db": resolve(__dirname, "../../lib/db/src/index.ts"),
    "@workspace/db/schema": resolve(
      __dirname,
      "../../lib/db/src/schema/index.ts"
    ),
  },

  tsconfig: resolve(__dirname, "tsconfig.json"),
  logLevel: "info",
});

// Copy GraphQL query files so they're available at runtime next to dist/.
mkdirSync("dist/queries", { recursive: true });
cpSync("queries", "dist/queries", { recursive: true });

console.log("✓ Build complete → dist/index.mjs");
console.log("✓ GraphQL queries copied → dist/queries/");
