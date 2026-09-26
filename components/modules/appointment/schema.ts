import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

export interface AppointmentSlot {
  startsAt: string;
  endsAt: string;
}

export interface AppointmentServiceView {
  serviceId: string;
  name: string;
  timezone: string;
  confirmationMode: "ON_REQUEST" | "INSTANTANEOUS";
  professionals: string[];
  slots: AppointmentSlot[];
}

export interface AppointmentBookingView {
  bookingToken: string;
  status: string;
  startsAt: string;
  endsAt: string;
}

export interface AppointmentStatusView {
  status: string;
  startsAt: string;
  endsAt: string;
  clientName: string | null;
}

export const bookingSchema = z.object({
  clientName: z.string().trim().min(2, "Indiquez votre nom"),
  clientPhone: z.string().trim().min(6, "Indiquez un numéro valide"),
  startsAt: z.string().min(1, "Choisissez un créneau"),
});

export type BookingInput = z.infer<typeof bookingSchema>;

/**
 * A client's own place in the day's line (JIKU-113): counts only, never who
 * else is waiting. [counter] names where to go once called.
 */
export type ClientLineTicketView = Schema<"ClientLineTicketView">;

export interface TakeLineTicketInput {
  clientName: string;
  clientPhone: string;
}
