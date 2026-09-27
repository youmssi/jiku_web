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
// Text budget (JIKU-188): the screens people glance at on a phone keep short
// texts. A placeholder counts as 8 characters; a plural or select block is
// measured by its longest branch. An exception names its key and its reason.
const budgets = [
  { file: "events.json", key: /^openInvitation\.share\.card/, max: 24 },
  { file: "events.json", key: /^openInvitation\.settings\./, max: 80 },
  { file: "guest.json", key: /^openInvitation\./, max: 60 },
  { file: "guest.json", key: /^ticket\./, max: 60 },
];
const budgetExceptions = new Map();

function entries(value, prefix = "") {
  if (typeof value !== "object" || value === null) return [[prefix, value]];
  return Object.entries(value).flatMap(([key, child]) => entries(child, prefix ? `${prefix}.${key}` : key));
}

function visibleLength(text) {
  let longest = text;
  const block = /\{[^{}]*,\s*(plural|select)\s*,((?:[^{}]*\{[^{}]*\})+)\s*\}/;
  while (block.test(longest)) {
    longest = longest.replace(block, (_, _kind, branches) => {
      const options = [...branches.matchAll(/\{([^{}]*)\}/g)].map((match) => match[1]);
      return options.reduce((a, b) => (b.length > a.length ? b : a), "");
    });
  }
  return longest.replace(/\{[^{}]*\}/g, "x".repeat(8)).replace(/#/g, "xx").length;
}

for (const locale of [reference, ...locales]) {
  for (const { file, key, max } of budgets) {
    const catalog = JSON.parse(readFileSync(join(root, locale, file), "utf8"));
    for (const [path, value] of entries(catalog)) {
      if (typeof value !== "string" || !key.test(path) || budgetExceptions.has(path)) continue;
      const length = visibleLength(value);
      if (length > max) problems.push(`${locale}/${file}: ${path} is ${length} characters, the budget is ${max}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`Catalogs match the ${reference} reference and keep their text budgets.`);
