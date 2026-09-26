import {
  Activity,
  Building2,
  CreditCard,
  FileSignature,
  MessageCircle,
  MessageSquareHeart,
  ScrollText,
  Settings2,
  Timer,
  UserPlus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ADMIN_ROUTES } from "@/lib/constants";
import type { Messages } from "@/i18n/messages";

type AdminNavKey = keyof Messages["admin"]["nav"];

export interface AdminNavItem {
  labelKey: AdminNavKey;
  href: string;
  icon: typeof Building2;
  match: (pathname: string) => boolean;
}

export interface AdminNavGroup {
  labelKey: AdminNavKey;
  items: AdminNavItem[];
}

/**
 * Single source of truth for the back-office navigation, consumed by the admin
 * sidebar so the desk and the platform sections can never drift apart.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    labelKey: "platform",
    items: [
      {
        labelKey: "tenants",
        href: ADMIN_ROUTES.TENANTS,
        icon: Building2,
        match: (pathname) => pathname === ADMIN_ROUTES.TENANTS,
      },
      {
        labelKey: "payments",
        href: ADMIN_ROUTES.PAYMENTS,
        icon: CreditCard,
        match: (pathname) => pathname === ADMIN_ROUTES.PAYMENTS,
      },
      {
        labelKey: "trials",
        href: ADMIN_ROUTES.TRIALS,
        icon: Timer,
        match: (pathname) => pathname === ADMIN_ROUTES.TRIALS,
      },
      {
        labelKey: "agreements",
        href: ADMIN_ROUTES.AGREEMENTS,
        icon: FileSignature,
        match: (pathname) => pathname === ADMIN_ROUTES.AGREEMENTS,
      },
      {
        labelKey: "billingInfo",
        href: ADMIN_ROUTES.BILLING_INFO,
        icon: Settings2,
        match: (pathname) => pathname === ADMIN_ROUTES.BILLING_INFO,
      },
    ],
  },
  {
    labelKey: "desk",
    items: [
      {
        labelKey: "audit",
        href: ADMIN_ROUTES.AUDIT,
        icon: ScrollText,
        match: (pathname) => pathname === ADMIN_ROUTES.AUDIT,
      },
      {
        labelKey: "whatsapp",
        href: ADMIN_ROUTES.WHATSAPP,
        icon: MessageCircle,
        match: (pathname) => pathname === ADMIN_ROUTES.WHATSAPP,
      },
      {
        labelKey: "prospects",
        href: ADMIN_ROUTES.PROSPECTS,
        icon: UserPlus,
        match: (pathname) => pathname === ADMIN_ROUTES.PROSPECTS,
      },
      {
        labelKey: "feedback",
        href: ADMIN_ROUTES.FEEDBACK,
        icon: MessageSquareHeart,
        match: (pathname) => pathname === ADMIN_ROUTES.FEEDBACK,
      },
      {
        labelKey: "diagnostics",
        href: ADMIN_ROUTES.DIAGNOSTICS,
        icon: Activity,
        match: (pathname) => pathname === ADMIN_ROUTES.DIAGNOSTICS,
      },
    ],
  },
];

/** The navigation with its labels in the operator's language, for the sidebar and the command palette. */
export function useAdminNavGroups() {
  const t = useTranslations("admin.nav");
  return ADMIN_NAV_GROUPS.map((group) => ({
    label: t(group.labelKey),
    items: group.items.map((item) => ({ ...item, label: t(item.labelKey) })),
  }));
}
