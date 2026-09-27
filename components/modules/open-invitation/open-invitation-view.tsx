import { getLocale, getTranslations } from "next-intl/server";
import { Stat, StateMessage } from "@/components/shared";
import { loadEvent } from "@/components/modules/event/server";
import { formatEventDay, formatEventTime } from "@/lib/datetime";
import { fetchPublicOpenInvitation, loadOpenInvitation, loadOpenResponses } from "./open-invitation.queries";
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

  const [responses, card] = await Promise.all([loadOpenResponses(eventId), fetchPublicOpenInvitation(invitation.code)]);
  const zone = event.timezone;
  const when = event.startDateTime
    ? `${formatEventDay(event.startDateTime, zone, locale)} · ${formatEventTime(event.startDateTime, zone, locale)}`
    : null;

  const answerBy = invitation.closesAt
    ? `${formatEventDay(invitation.closesAt, zone, locale)} · ${formatEventTime(invitation.closesAt, zone, locale)}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      {heading}
      {invitation.accepting ? null : (
        <StateMessage title={t("closedTitle")} description={t(`closed.${invitation.closedReason ?? "DISABLED"}`)} />
      )}
      <SharePanel
        code={invitation.code}
        card={{
          eventName: event.name,
          when,
          location: event.location ?? null,
          organizerName: card?.organizerName ?? event.name,
          primaryColor: card?.primaryColor ?? null,
          answerBy,
        }}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={t("stats.expected")} value={invitation.counts.expected} tone="positive" />
        <Stat label={t("stats.yes")} value={invitation.counts.yes} />
        <Stat label={t("stats.maybe")} value={invitation.counts.maybe} tone="muted" />
        <Stat
          label={t("stats.remaining")}
          value={invitation.remainingPlaces ?? t("stats.unlimited")}
          tone={invitation.remainingPlaces === 0 ? "urgent" : "default"}
        />
      </div>
      <OpenResponses eventId={eventId} responses={responses} />
      <OpenSettingsForm eventId={eventId} invitation={invitation} />
    </div>
  );
}
