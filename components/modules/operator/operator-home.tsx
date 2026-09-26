import { getLocale, getTranslations } from "next-intl/server";
import { CalendarDays, ChevronRight, ListOrdered } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { formatEventDay, formatEventTime } from "@/lib/datetime";
import type { OperatorConsoleView } from "@/components/modules/operator/schema";

/**
 * An operator's home (JIKU-116): who they are, what they may do, then one entry
 * per event door and per service line in their scope. Each opens the matching
 * console, under the same link.
 */
export async function OperatorHome({ code, view }: { code: string; view: OperatorConsoleView }) {
  const [t, locale] = await Promise.all([getTranslations("operator.console"), getLocale()]);
  const base = `/operator/${encodeURIComponent(code)}`;
  const empty = view.events.length === 0 && view.services.length === 0;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 text-zinc-100">
      <p className="text-sm text-zinc-400">{t("hello")}</p>
      <h1 className="text-2xl font-semibold">{view.label}</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {view.actions.map((action) => (
          <Badge key={action} variant="secondary">
            {t(`actions.${action}`)}
          </Badge>
        ))}
      </div>

      {empty ? <p className="mt-8 text-sm text-zinc-400">{t("empty")}</p> : null}

      {view.events.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-zinc-400">{t("events")}</h2>
          <ul className="flex flex-col gap-2">
            {view.events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`${base}/events/${event.id}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600"
                >
                  <CalendarDays aria-hidden className="size-5 shrink-0 text-zinc-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{event.name}</span>
                    <span className="block truncate text-xs text-zinc-400">
                      {event.startDateTime
                        ? `${formatEventDay(event.startDateTime, event.timezone, locale)} · ${formatEventTime(event.startDateTime, event.timezone, locale)}`
                        : null}
                      {event.location ? ` · ${event.location}` : null}
                    </span>
                  </span>
                  {event.status === "CANCELLED" ? <Badge variant="destructive">{t("cancelled")}</Badge> : null}
                  <ChevronRight aria-hidden className="size-4 shrink-0 text-zinc-500" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {view.services.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-zinc-400">{t("services")}</h2>
          <ul className="flex flex-col gap-2">
            {view.services.map((service) => (
              <li key={service.id}>
                <Link
                  href={`${base}/services/${service.id}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600"
                >
                  <ListOrdered aria-hidden className="size-5 shrink-0 text-zinc-400" />
                  <span className="min-w-0 flex-1 truncate font-medium">{service.name}</span>
                  <ChevronRight aria-hidden className="size-4 shrink-0 text-zinc-500" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/** Shown when an operator's link was revoked or never existed. */
export async function OperatorLinkInvalid() {
  const t = await getTranslations("operator.console");
  return (
    <div className="flex flex-1 items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <h2 className="text-xl font-semibold text-zinc-100">{t("invalidTitle")}</h2>
        <p className="mt-2 text-zinc-400">{t("invalidText")}</p>
      </div>
    </div>
  );
}

/** Back to the operator's home from one of their consoles. */
export async function OperatorBackLink({ code }: { code: string }) {
  const t = await getTranslations("operator.console");
  return (
    <Link
      href={`/operator/${encodeURIComponent(code)}`}
      className="px-5 pt-3 text-sm text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
    >
      ← {t("back")}
    </Link>
  );
}
