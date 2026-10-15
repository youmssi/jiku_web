/**
 * Tells IndexNow search engines (Bing, Yandex, Seznam, Naver) that every page
 * in the live sitemap changed, so they recrawl it now instead of in weeks. Run
 * after a release that changes public pages:
 *
 *   SITE_URL=https://example.com INDEXNOW_KEY=... node scripts/indexnow.mjs
 *
 * The same key must be deployed as INDEXNOW_KEY, which serves it at
 * /indexnow-key.txt for the engines to check.
 */

const site = process.env.SITE_URL?.replace(/\/$/, "");
const key = process.env.INDEXNOW_KEY;
if (!site || !key) {
  console.error("Set SITE_URL and INDEXNOW_KEY.");
  process.exit(1);
}

const keyLocation = `${site}/indexnow-key.txt`;
const published = await fetch(keyLocation).then((response) => (response.ok ? response.text() : ""));
if (published.trim() !== key) {
  console.error(`${keyLocation} does not serve this key: deploy INDEXNOW_KEY first.`);
  process.exit(1);
}

const sitemap = await fetch(`${site}/sitemap.xml`).then((response) => response.text());
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (urlList.length === 0) {
  console.error("The sitemap lists no URL.");
  process.exit(1);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation, urlList }),
});
console.log(`IndexNow: ${response.status} for ${urlList.length} URLs`);
process.exit(response.ok ? 0 : 1);
