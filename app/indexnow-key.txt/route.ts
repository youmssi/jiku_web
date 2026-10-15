/**
 * The IndexNow key file (indexnow.org). Bing, Yandex, Seznam and Naver fetch it
 * to confirm that a URL submission (scripts/indexnow.mjs) comes from the site's
 * owner. Answers 404 until INDEXNOW_KEY is set.
 */
export const dynamic = "force-dynamic";

export function GET(): Response {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return new Response("Not found", { status: 404 });
  return new Response(key, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
