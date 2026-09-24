import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AddGuestDialog, ExportGuestsButton, ImportGuestsDialog, SendInvitationsDialog } from "@/components/modules/guest/guest-actions";
import { GuestsTable, type GuestRow } from "@/components/modules/guest/guests-table";
import type { TicketTypeResponse } from "@/components/modules/event";
import { reportApiError } from "@/lib/action-result";
import { serverFetch } from "@/lib/api-server";
import type { Guest, Invitation } from "@/components/modules/guest/schema";
import { INVITATION_CHANNELS, type InvitationChannel } from "@/lib/channels";
import { eventGuestsExportRoute } from "@/lib/constants";

async function readList<T>(path: string): Promise<T[]> {
  const response = await serverFetch(path);
  if (!response.ok) {
    reportApiError(response, "guest");
    return [];
  }
  return (await response.json()) as T[];
}

/**
 * An event's Guests tab: who is on the list, what they answered, whether they
 * were reached on each channel, and what a sold ticket still owes. Adding,
 * importing and inviting open in dialogs from the toolbar.
 */
export async function GuestsView({ eventId }: { eventId: string }) {
  const [guests, invitations, ticketTypes, eventResponse, t] = await Promise.all([
    readList<Guest>(`/events/${eventId}/guests`),
    readList<Invitation>(`/events/${eventId}/invitations`),
    readList<TicketTypeResponse>(`/events/${eventId}/ticket-types`),
    serverFetch(`/events/${eventId}`),
    getTranslations("guests"),
  ]);
  const enabledChannels: InvitationChannel[] = eventResponse.ok
    ? ((await eventResponse.json()) as { invitationChannels: InvitationChannel[] }).invitationChannels
    : [];

  const invitationStatus = new Map(
    invitations.map((invitation) => [`${invitation.guestId}:${invitation.channel}`, invitation.status]),
  );
  const rows: GuestRow[] = guests.map((guest) => ({
    id: guest.id,
    name: `${guest.firstName} ${guest.lastName}`.trim(),
    email: guest.email ?? null,
    phone: guest.phoneNumber ?? null,
    excludedFromInvitations: guest.excludedFromInvitations,
    checkedInAt: guest.checkedInAt ?? null,
    ticketTypeId: guest.ticketTypeId ?? null,
    rsvpStatus: guest.rsvpStatus ?? "PENDING",
    ticketCode: guest.ticketCode ?? null,
    paymentStatus: guest.paymentStatus ?? null,
    amountDueMinor: guest.amountDueMinor ?? null,
    amountDueCurrency: guest.amountDueCurrency ?? null,
    invitations: Object.fromEntries(
      INVITATION_CHANNELS.map((channel) => [channel, invitationStatus.get(`${guest.id}:${channel}`) ?? null]),
    ),
  }));
  const reach = {
    EMAIL: guests.filter((guest) => guest.email && !guest.excludedFromInvitations).length,
    WHATSAPP: guests.filter((guest) => guest.phoneNumber && !guest.excludedFromInvitations).length,
  } satisfies Record<InvitationChannel, number>;

  return (
    <section aria-labelledby="guests-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="guests-title" className="text-lg font-medium">
          {t("title", { count: guests.length })}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {guests.length > 0 ? <ExportGuestsButton href={eventGuestsExportRoute(eventId)} /> : null}
          <ImportGuestsDialog eventId={eventId} />
          <AddGuestDialog eventId={eventId} />
          {guests.length > 0 ? (
            <SendInvitationsDialog eventId={eventId} enabledChannels={enabledChannels} reach={reach} />
          ) : null}
        </div>
      </div>

      {guests.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <ImportGuestsDialog eventId={eventId} />
            <AddGuestDialog eventId={eventId} />
          </EmptyContent>
        </Empty>
      ) : (
        <GuestsTable eventId={eventId} rows={rows} ticketTypes={ticketTypes} />
      )}
    </section>
  );
}
