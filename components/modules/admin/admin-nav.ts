import {
  Activity,
  Building2,
  CalendarClock,
  CreditCard,
  FileSignature,
  MessageCircle,
  ReceiptText,
  ScrollText,
  Settings2,
  Timer,
  UserPlus,
} from "lucide-react";
import { ADMIN_ROUTES } from "@/lib/constants";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: typeof Building2;
  match: (pathname: string) => boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/**
 * Single source of truth for the back-office navigation, consumed by the admin
 * sidebar so the desk and the platform sections can never drift apart.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Platform",
    items: [
      {
        label: "Tenants",
        href: ADMIN_ROUTES.TENANTS,
        icon: Building2,
        match: (pathname) => pathname === ADMIN_ROUTES.TENANTS,
      },
      {
        label: "Payments",
        href: ADMIN_ROUTES.PAYMENTS,
        icon: CreditCard,
        match: (pathname) => pathname === ADMIN_ROUTES.PAYMENTS,
      },
      {
        label: "Trials",
        href: ADMIN_ROUTES.TRIALS,
        icon: Timer,
        match: (pathname) => pathname === ADMIN_ROUTES.TRIALS,
      },
      {
        label: "Agreements",
        href: ADMIN_ROUTES.AGREEMENTS,
        icon: FileSignature,
        match: (pathname) => pathname === ADMIN_ROUTES.AGREEMENTS,
      },
      {
        label: "Billing info",
        href: ADMIN_ROUTES.BILLING_INFO,
        icon: Settings2,
        match: (pathname) => pathname === ADMIN_ROUTES.BILLING_INFO,
      },
    ],
  },
  {
    label: "Desk",
    items: [
      {
        label: "Bookings",
        href: ADMIN_ROUTES.BOOKINGS,
        icon: CalendarClock,
        match: (pathname) => pathname === ADMIN_ROUTES.BOOKINGS,
      },
      {
        label: "Booking payments",
        href: ADMIN_ROUTES.BOOKING_PAYMENTS,
        icon: ReceiptText,
        match: (pathname) => pathname === ADMIN_ROUTES.BOOKING_PAYMENTS,
      },
      {
        label: "Audit",
        href: ADMIN_ROUTES.AUDIT,
        icon: ScrollText,
        match: (pathname) => pathname === ADMIN_ROUTES.AUDIT,
      },
      {
        label: "WhatsApp",
        href: ADMIN_ROUTES.WHATSAPP,
        icon: MessageCircle,
        match: (pathname) => pathname === ADMIN_ROUTES.WHATSAPP,
      },
      {
        label: "Prospects",
        href: ADMIN_ROUTES.PROSPECTS,
        icon: UserPlus,
        match: (pathname) => pathname === ADMIN_ROUTES.PROSPECTS,
      },
      {
        label: "Diagnostics",
        href: ADMIN_ROUTES.DIAGNOSTICS,
        icon: Activity,
        match: (pathname) => pathname === ADMIN_ROUTES.DIAGNOSTICS,
      },
    ],
  },
];
