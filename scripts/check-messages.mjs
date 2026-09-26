// Fails when a locale's catalogs drift from the French reference: a missing
// file, a missing key, an extra key, or a value of another shape.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../messages/", import.meta.url).pathname;
const reference = "fr";
const locales = readdirSync(root).filter((entry) => entry !== reference);

function keys(value, prefix = "") {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [`${prefix}:${Array.isArray(value) ? "array" : typeof value}`];
  return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key));
}

const problems = [];
for (const file of readdirSync(join(root, reference))) {
  const expected = new Set(keys(JSON.parse(readFileSync(join(root, reference, file), "utf8"))));
  for (const locale of locales) {
    let actual;
    try {
      actual = new Set(keys(JSON.parse(readFileSync(join(root, locale, file), "utf8"))));
    } catch {
      problems.push(`${locale}/${file}: missing`);
      continue;
    }
    for (const key of expected) if (!actual.has(key)) problems.push(`${locale}/${file}: missing ${key}`);
    for (const key of actual) if (!expected.has(key)) problems.push(`${locale}/${file}: unexpected ${key}`);
  }
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`Catalogs match the ${reference} reference.`);
