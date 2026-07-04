/** Guest-facing RSVP view for one invitation (mirrors the backend RsvpView). */
export interface RsvpView {
  eventName: string;
  eventWhen: string | null;
  eventLocation: string | null;
  organizerName: string;
  primaryColor: string;
  logoUrl: string | null;
  guestName: string;
  status: string;
  ticketCode: string | null;
  erased: boolean;
}
