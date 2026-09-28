import { getLocale, getTranslations } from "next-intl/server";
import { StateMessage } from "@/components/shared";
import { cardFontVariables } from "@/lib/card-display-fonts";
import { FALLBACK_BRAND_COLOR } from "@/lib/card-style";
import { CardLook } from "./card-look";
import { loadEvent } from "@/components/modules/event/server";
import { shortDay, shortTime, shortWhen } from "@/lib/short-dates";
import { fetchPublicOpenInvitation, loadEventLook, loadOpenInvitation, loadOpenResponses } from "./open-invitation.queries";
import { OpenInvitationStart } from "./open-invitation-start";
import { OpenResponses } from "./open-responses";
import { OpenSettingsForm } from "./open-settings-form";
import { SharePanel } from "./share-panel";

/**
 * An event's open invitation tab (JIKU-184, ADR 106): the card to share, the
 * answers counted live, who answered, and the settings. Before the invitation
 * is opened, what it does and the button that opens it.
 */
export async function OpenInvitationView({ eventId }: { eventId: string }) {
  const [{ invitation, failed }, loaded, t, locale] = await Promise.all([
    loadOpenInvitation(eventId),
    loadEvent(eventId),
    getTranslations("events.openInvitation"),
    getLocale(),
  ]);
  const heading = (
    <div>
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>
    </div>
  );
  if (failed || loaded.kind !== "ok") {
    return (
      <div className="flex flex-col gap-6">
        {heading}
        <StateMessage title={t("loadFailedTitle")} description={t("loadFailed")} />
      </div>
    );
  }
  const event = loaded.event;
  if (!invitation) {
    return (
      <div className="flex flex-col gap-6">
        {heading}
        <OpenInvitationStart eventId={eventId} published={event.status === "PUBLISHED"} />
      </div>
    );
  }

  const [responses, card, look] = await Promise.all([
    loadOpenResponses(eventId),
    fetchPublicOpenInvitation(invitation.code),
    loadEventLook(eventId),
  ]);
  const zone = event.timezone;
  const when = event.startDateTime ? shortWhen(event.startDateTime, zone, locale) : null;

  const answerBy = invitation.closesAt
    ? `${shortDay(invitation.closesAt, zone, locale, { weekday: false })} · ${shortTime(invitation.closesAt, zone, locale)}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      {heading}
      {invitation.accepting ? null : (
        <StateMessage title={t("closedTitle")} description={t(`closed.${invitation.closedReason ?? "DISABLED"}`)} />
      )}
      <Attendance
        expected={invitation.counts.expected}
        yes={invitation.counts.yes}
        maybe={invitation.counts.maybe}
        remaining={invitation.remainingPlaces ?? null}
        labels={{
          expected: t("stats.expected"),
          yes: t("stats.yes"),
          maybe: t("stats.maybe"),
          remaining: invitation.remainingPlaces === null || invitation.remainingPlaces === undefined
            ? t("stats.unlimited")
            : t("stats.remainingCount", { count: invitation.remainingPlaces }),
        }}
      />
      <SharePanel code={invitation.code} card={{ eventName: event.name, when, answerBy }} />
      <div className={cardFontVariables}>
        <CardLook
          eventId={eventId}
          code={invitation.code}
          look={look}
          color={card?.primaryColor ?? FALLBACK_BRAND_COLOR}
        />
      </div>
      <OpenResponses eventId={eventId} responses={responses} />
      <OpenSettingsForm eventId={eventId} invitation={invitation} />
    </div>
  );
}

/**
 * The one number the organizer comes for — how many people are expected —
 * with how full the event is when it has a capacity.
 */
function Attendance({
  expected,
  yes,
  maybe,
  remaining,
  labels,
}: {
  expected: number;
  yes: number;
  maybe: number;
  remaining: number | null;
  labels: { expected: string; yes: string; maybe: string; remaining: string };
}) {
  const capacity = remaining === null ? null : expected + remaining;
  const filled = capacity ? Math.min(100, Math.round((expected / capacity) * 100)) : 0;
  return (
    <section className="flex flex-col gap-4 rounded-xl border p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-5xl font-bold tabular-nums leading-none tracking-tight">
            {expected}
            {capacity ? <span className="text-2xl font-semibold text-muted-foreground"> / {capacity}</span> : null}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{labels.expected}</p>
        </div>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            {labels.yes} · {yes}
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
            {labels.maybe} · {maybe}
          </span>
        </div>
      </div>
      {capacity ? (
        <div
          role="meter"
          aria-valuemin={0}
          aria-valuemax={capacity}
          aria-valuenow={expected}
          aria-label={labels.expected}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div className={remaining === 0 ? "h-full bg-red-600" : "h-full bg-foreground"} style={{ width: `${filled}%` }} />
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">{labels.remaining}</p>
    </section>
  );
}
