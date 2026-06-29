/*
 * Jikū service worker — application-shell caching (JIKU-9).
 *
 * Scope: this story establishes the PWA shell only. It caches the Next.js build
 * assets (JS/CSS) and visited page shells so navigation works on a degraded or
 * dropped network. It deliberately does NOT cache guest-list or check-in data —
 * offline check-in with IndexedDB sync is a later story (JIKU-25).
 *
 * Strategies:
 *  - Navigations: network-first, falling back to the last cached page, then to a
 *    branded /offline shell.
 *  - Build assets under /_next/static: stale-while-revalidate (cache-first with a
 *    background refresh) — these are content-hashed, so cached copies stay valid.
 */
const VERSION = "v1";
const SHELL_CACHE = `jiku-shell-${VERSION}`;
const ASSET_CACHE = `jiku-assets-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || cache.match(OFFLINE_URL);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}
