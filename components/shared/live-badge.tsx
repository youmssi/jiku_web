"use client";

import { useTranslations } from "next-intl";

/** Says a screen follows the live stream (JIKU-214), so nobody reaches for reload. */
export function LiveBadge() {
  const t = useTranslations("common.live");
  return (
    <span
      title={t("hint")}
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400"
    >
      <span aria-hidden className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-green-500" />
      </span>
      {t("label")}
    </span>
  );
}
