import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.offline");
  return { title: t("title") };
}

/**
 * Branded fallback shown by the service worker when a navigation is attempted with
 * no network and no cached copy of the requested page (JIKU-9).
 */
export default async function OfflinePage() {
  const t = await getTranslations("common");
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-950 px-6 py-16 text-center text-zinc-100">
      <div className="max-w-sm">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">{t("brand")}</p>
        <h1 className="mt-3 text-2xl font-semibold">{t("offline.title")}</h1>
        <p className="mt-2 text-zinc-400">{t("offline.description")}</p>
      </div>
    </div>
  );
}
