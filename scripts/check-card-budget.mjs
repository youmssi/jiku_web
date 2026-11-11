#!/usr/bin/env node
// Weight budget of a shared card's page (JIKU-287): the guest opens it on a
// slow, metered connection, often inside Facebook's or WhatsApp's browser.
// After `pnpm build`, this sums the gzipped JavaScript the page loads (Next's
// runtime, the layouts above it and the page itself) and fails when it grows
// past the budget, so a stray import cannot quietly double the page's weight.
// Run with: node scripts/check-card-budget.mjs
import { readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { createRequire } from "node:module";
import path from "node:path";

/** Gzipped JavaScript a card page may load, in KB. Measured 321 KB on 3 Nov 2026 (it was 455 KB before JIKU-287); React, Next and Sentry make most of it. */
const BUDGET_KB = 340;

const root = process.cwd();
const page = "/[locale]/(guest)/i/[code]/page";
const segments = ["[locale]/layout", "[locale]/error", "[locale]/not-found", "[locale]/(guest)/layout", "[locale]/(guest)/i/[code]/page"];
const manifestFile = path.join(root, ".next/server/app/[locale]/(guest)/i/[code]/page_client-reference-manifest.js");
const buildManifest = JSON.parse(readFileSync(path.join(root, ".next/server/app/[locale]/(guest)/i/[code]/page/build-manifest.json"), "utf8"));

globalThis.__RSC_MANIFEST = {};
createRequire(import.meta.url)(manifestFile);
const manifest = globalThis.__RSC_MANIFEST[page];
if (!manifest) throw new Error(`No client manifest for ${page}: run pnpm build first.`);

const files = new Set(buildManifest.rootMainFiles.map((file) => `/_next/${file}`));
for (const [entry, chunks] of Object.entries(manifest.entryJSFiles)) {
  if (segments.some((segment) => entry.endsWith(`/app/${segment}`))) chunks.forEach((chunk) => files.add(chunk.startsWith("/") ? chunk : `/_next/${chunk}`));
}

let total = 0;
for (const file of files) {
  const local = path.join(root, ".next", file.replace(/^\/_next\//, ""));
  statSync(local);
  total += gzipSync(readFileSync(local)).length;
}
const kb = Math.round(total / 1024);
console.log(`Card page JavaScript: ${kb} KB gzipped across ${files.size} files (budget ${BUDGET_KB} KB).`);
if (kb > BUDGET_KB) {
  console.error(`The card page grew past its budget by ${kb - BUDGET_KB} KB. Look for a barrel import pulling organizer or marketing code into guest pages.`);
  process.exit(1);
}
