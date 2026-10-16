import { getFormatter, getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { INVITATION_CHANNEL_LABELS } from "@/lib/channels";
import type { EventResponse } from "./schema";

/**
 * A published or cancelled event's settings as its guests received them
 * (JIKU-255): a short read-only summary instead of the whole form greyed out,
 * showing only the options in use.
 */
export async function EventSummary({ event }: { event: EventResponse }) {
  const [t, format] = await Promise.all([getTranslations("events.settings"), getFormatter()]);
  const when = (iso: string | null | undefined) =>
    iso ? format.dateTime(new Date(iso), { timeZone: event.timezone, dateStyle: "full", timeStyle: "short" }) : null;
  const { settings } = event;
  const rows: [string, string | null][] = [
    [t("name"), event.name],
    [t("descriptionLabel"), event.description || null],
    [t("start"), when(event.startDateTime)],
    [t("end"), when(event.endDateTime)],
    [t("location"), event.location || null],
    [t("timezone"), event.timezone],
    [t("invitations.mode.label"), t(`invitations.mode.${settings.deliveryMode}.title`)],
    [t("invitations.channels"), event.invitationChannels.map((channel) => INVITATION_CHANNEL_LABELS[channel]).join(", ")],
    [t("client.name"), settings.brandName || null],
    [
      t("rules.transfer"),
      settings.transferAllowed
        ? settings.transferDeadline
          ? t("summary.until", { date: when(settings.transferDeadline) ?? "" })
          : t("summary.yes")
        : null,
    ],
    [
      t("rules.overbooking"),
      settings.overbookingAllowed ? t("summary.extra", { count: settings.maxOverbookingCount ?? 0 }) : null,
    ],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("summary.title")}</CardTitle>
        <CardDescription>{t("locked.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="divide-y text-sm">
          {rows
            .filter((row): row is [string, string] => row[1] !== null)
            .map(([label, value]) => (
              <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-3 sm:gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="break-words sm:col-span-2">{value}</dd>
              </div>
            ))}
        </dl>
      </CardContent>
    </Card>
  );
}
