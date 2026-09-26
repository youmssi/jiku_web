import "server-only";

import { localeRedirect } from "@/i18n/redirect";
import { reportApiError } from "@/lib/action-result";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";
import type {
  AdminAgreement,
  AdminBillingSettingsView,
  AdminPayment,
  AdminTierCatalog,
  AdminTrialPage,
  AdminTrialStats,
  AuditPage,
  FeedbackPage,
  ProspectLead,
  RatingSummary,
  TenantDirectoryPage,
  WhatsAppOverrideStatus,
  WhatsAppPricingInfo,
} from "@/components/modules/admin/schema";

/**
 * Reads for the platform desk's pages (JIKU-46), for Server Components only:
 * they are never exposed as Server Actions. An expired or missing admin session
 * sends the operator back to the admin login; any other failure opens the page
 * on its empty state, so one failing panel never takes the desk down.
 */
async function adminRead<T>(path: string, fallback: T): Promise<T> {
  const response = await adminFetch(path);
  if (response.status === 401 || response.status === 403) {
    return localeRedirect(ADMIN_ROUTES.LOGIN);
  }
  if (!response.ok) {
    reportApiError(response, "admin");
    return fallback;
  }
  return (await response.json()) as T;
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(name, String(value));
  }
  return search.toString();
}

const DIRECTORY_PAGE_SIZE = 50;
const DESK_PAGE_SIZE = 50;
const AUDIT_PAGE_SIZE = 100;
const TRIALS_PAGE_SIZE = 25;

const EMPTY_CATALOG: AdminTierCatalog = { currency: "", tiers: [] };

/** Confirms the admin session is still accepted, for pages that load nothing up front. */
export async function requireAdminSession(): Promise<void> {
  await adminRead(`/admin/tenants?${query({ size: 1 })}`, null);
}

export function loadTenantDirectory(search?: string): Promise<TenantDirectoryPage> {
  return adminRead(`/admin/tenants?${query({ size: DIRECTORY_PAGE_SIZE, query: search })}`, {
    entries: [],
    total: 0,
    page: 0,
    size: DIRECTORY_PAGE_SIZE,
  });
}

export function loadPayments(status = "PENDING"): Promise<AdminPayment[]> {
  return adminRead(`/admin/payments?${query({ size: DESK_PAGE_SIZE, status })}`, []);
}

export async function loadTrials(page: number) {
  const [trialsPage, stats, catalog] = await Promise.all([
    adminRead<AdminTrialPage>(`/admin/trials?${query({ page, size: TRIALS_PAGE_SIZE })}`, {
      entries: [],
      total: 0,
      page,
      size: TRIALS_PAGE_SIZE,
    }),
    adminRead<AdminTrialStats>("/admin/trials/stats", {
      active: 0,
      expiringWithin7Days: 0,
      convertedThisMonth: 0,
      conversionRatePercent: null,
    }),
    adminRead<AdminTierCatalog>("/admin/billing/tiers", EMPTY_CATALOG),
  ]);
  return { trialsPage, stats, catalog };
}

export async function loadAgreements() {
  const [agreements, catalog] = await Promise.all([
    adminRead<AdminAgreement[]>(`/admin/agreements?${query({ size: DESK_PAGE_SIZE })}`, []),
    adminRead<AdminTierCatalog>("/admin/billing/tiers", EMPTY_CATALOG),
  ]);
  return { agreements, catalog };
}

const FEEDBACK_PAGE_SIZE = 50;

/** The feedback inbox, newest first, filtered by kind and status. */
export function loadFeedback(kind?: string, status?: string): Promise<FeedbackPage> {
  return adminRead(`/admin/feedback?${query({ size: FEEDBACK_PAGE_SIZE, kind, status })}`, {
    items: [],
    total: 0,
    page: 0,
    size: FEEDBACK_PAGE_SIZE,
  });
}

/** Average rating and response count per moment over the last 30 days. */
export function loadRatingSummary(): Promise<RatingSummary[]> {
  return adminRead("/admin/feedback/ratings?days=30", []);
}

export function loadAudit(action?: string): Promise<AuditPage> {
  return adminRead(`/admin/audit?${query({ size: AUDIT_PAGE_SIZE, action })}`, {
    entries: [],
    total: 0,
    page: 0,
    size: AUDIT_PAGE_SIZE,
  });
}

export async function loadWhatsApp() {
  const [pricing, override] = await Promise.all([
    adminRead<WhatsAppPricingInfo[]>("/admin/whatsapp/pricing", []),
    adminRead<WhatsAppOverrideStatus>("/admin/whatsapp/content-override", {
      active: false,
      reason: null,
      activatedBy: null,
      activatedAt: null,
    }),
  ]);
  return { pricing, override };
}

export function loadProspects(): Promise<ProspectLead[]> {
  return adminRead("/admin/prospects", []);
}

/**
 * The payee and price grids as the desk sees them; the backend returns the
 * environment defaults until something is saved. Null when they cannot load.
 */
export function loadBillingSettings(): Promise<AdminBillingSettingsView | null> {
  return adminRead<AdminBillingSettingsView | null>("/admin/billing/settings", null);
}
