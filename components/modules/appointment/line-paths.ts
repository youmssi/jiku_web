import type { AppointmentLinkRef } from "@/components/modules/appointment/appointment.service";

/** Where a client takes a ticket for [ref]'s line; the entrance QR points here. */
export function lineTakePath(ref: AppointmentLinkRef): string {
  return "token" in ref ? `/appointments/${encodeURIComponent(ref.token)}/line` : `/r/${encodeURIComponent(ref.code)}/line`;
}

/** A client's own ticket page in [ref]'s line. */
export function lineTicketPath(ref: AppointmentLinkRef, ticketCode: string): string {
  return `${lineTakePath(ref)}/${encodeURIComponent(ticketCode)}`;
}
