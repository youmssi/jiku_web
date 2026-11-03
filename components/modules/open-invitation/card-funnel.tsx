import { getFormatter, getTranslations } from "next-intl/server";
import type { CardFunnelRow } from "./schema";

/** Below this many visits a rate says more about chance than about a network. */
const MIN_VISITS_FOR_RATE = 5;

/**
 * Where a card's answers come from (JIKU-282): for each network, the answers
 * first, then the visits and shares behind them, and the share of visitors who
 * answered. Numbers only; nobody is named.
 */
export async function CardFunnel({ rows }: { rows: CardFunnelRow[] | null }) {
  const [t, format] = await Promise.all([getTranslations("events.openInvitation.funnel"), getFormatter()]);
  const most = Math.max(1, ...(rows ?? []).map((row) => row.answers));

  return (
    <section aria-labelledby="card-funnel-title" className="flex flex-col gap-3 rounded-xl border p-4">
      <div>
        <h3 id="card-funnel-title" className="text-sm font-medium">
          {t("title")}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("text")}</p>
      </div>
      {rows === null ? (
        <p className="text-sm text-muted-foreground">{t("failed")}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col divide-y">
          {rows.map((row) => {
            const rate =
              row.visits >= MIN_VISITS_FOR_RATE
                ? format.number(Math.min(1, row.answers / row.visits), { style: "percent", maximumFractionDigits: 0 })
                : null;
            return (
              <li key={row.source} className="flex flex-col gap-1.5 py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">{t(`source.${sourceKey(row.source)}`)}</span>
                  <span className="text-sm font-semibold tabular-nums">{t("answers", { count: row.answers })}</span>
                </div>
                <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-foreground" style={{ width: `${(row.answers / most) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {t("detail", { shares: row.shares, visits: row.visits, coming: row.coming })}
                  {" · "}
                  {rate ? t("rate", { rate }) : t("rateTooFew")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const KNOWN_SOURCES = ["whatsapp", "facebook", "telegram", "share", "link", "qr", "other"] as const;

function sourceKey(source: string): (typeof KNOWN_SOURCES)[number] {
  return KNOWN_SOURCES.find((known) => known === source) ?? "other";
}
