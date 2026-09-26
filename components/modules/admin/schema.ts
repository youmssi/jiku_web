import type { components } from "@/lib/api-types";
// CONTRACT — types mirroring the backend platform-admin API (JIKU-40/41/42/43).

import { z } from "zod";

export interface TenantDirectoryEntry {
  id: string;
  name: string;
  contactEmail: string;
  status: string;
  createdAt: string;
  organizerCount: number;
}

export interface TenantDirectoryPage {
  entries: TenantDirectoryEntry[];
  total: number;
  page: number;
  size: number;
}

export interface AdminPayment {
  id: string;
  tenantId: string;
  eventId: string;
  tier: string;
  amountMinor: number;
  currency: string;
  provider: string;
  reference: string;
  status: string;
  createdAt: string;
}

/**
 * The configured pricing grid, read from the backend (JIKU-66) rather than
 * restated here — the operator must be offered exactly the tiers the platform
 * is running, and a second copy in the UI would drift the next time pricing
 * changes in configuration.
 */
/** One price in the three billing currencies (ADR 105); USD is in cents. */
export interface AdminPriceList {
  gnf: number;
  fcfa: number;
  usdCents: number;
}

export interface AdminTierOption {
  name: string;
  maxGuests: number;
  price: AdminPriceList;
  /** The GNF price, kept by the API for older clients. */
  priceMinor: number;
}

export interface AdminTierCatalog {
  currency: string;
  tiers: AdminTierOption[];
}

export interface AdminTrial {
  id: string;
  tenantId: string;
  tenantName: string | null;
  eventId: string;
  eventName: string | null;
  tier: string;
  grantedAllowance: number;
  expiresAt: string;
  status: string;
  endedReason: string | null;
  createdAt: string;
}

/** One page of the admin trial listing, with the true total across every page (JIKU-99). */
export interface AdminTrialPage {
  entries: AdminTrial[];
  total: number;
  page: number;
  size: number;
}

/** Platform-wide trial funnel snapshot for the overview strip (JIKU-99). */
export interface AdminTrialStats {
  active: number;
  expiringWithin7Days: number;
  convertedThisMonth: number;
  /** Null until at least one trial has ever concluded. */
  conversionRatePercent: number | null;
}

/** An event as the trial grant form's tenant-scoped picker sees it (JIKU-99). */
export interface AdminEventSummary {
  id: string;
  name: string;
  startDateTime: string | null;
  status: string;
}

export interface AdminAgreement {
  id: string;
  tenantId: string;
  kind: string;
  periodStart: string;
  periodEnd: string;
  renewalAt: string;
  amountMinor: number | null;
  currency: string | null;
  status: string;
  notes: string | null;
  interruptedReason: string | null;
  renewedBy: string | null;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  adminId: string;
  action: string;
  target: string;
  note: string | null;
  createdAt: string;
}

export interface AuditPage {
  entries: AuditEntry[];
  total: number;
  page: number;
  size: number;
}

export interface WhatsAppPricingInfo {
  category: string;
  costUsdMinor: number;
}

export interface WhatsAppOverrideStatus {
  active: boolean;
  reason: string | null;
  activatedBy: string | null;
  activatedAt: string | null;
}

export interface ProspectLead {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string | null;
  sector: string;
  city: string | null;
  weeklyVolume: string | null;
  note: string | null;
  source: string | null;
  status: string;
  createdAt: string;
  contactedAt: string | null;
}

/** Shape an admin form needs to identify a tenant: full id, everything else structural. */
const adminTenantReferenceSchema = z.object({ id: z.string().min(1) });

export const adminLoginSchema = z.object({
  email: z.string().trim().email("email"),
  password: z.string().min(1, "required"),
});
export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

/** Shape an admin form needs to identify an event: full id, everything else structural. */
const adminEventReferenceSchema = z.object({ id: z.string().min(1) });

export const grantTrialSchema = z.object({
  tenant: z
    .union([adminTenantReferenceSchema, z.null()])
    .refine((tenant) => tenant !== null, "pickOrganization"),
  event: z
    .union([adminEventReferenceSchema, z.null()])
    .refine((event) => event !== null, "pickEvent"),
  tier: z.string().min(1, "pickTier"),
  expiresAt: z
    .string()
    .min(1, "required")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "invalidDate",
    )
    .refine(
      (value) => new Date(value).getTime() > Date.now(),
      "dateInFuture",
    ),
});
export interface GrantTrialFormValues {
  tenant: TenantDirectoryEntry | null;
  event: AdminEventSummary | null;
  tier: string;
  expiresAt: string;
}

export const createAgreementSchema = z
  .object({
    tenant: z
      .union([adminTenantReferenceSchema, z.null()])
      .refine((tenant) => tenant !== null, "pickOrganization"),
    kind: z.enum(["ENTERPRISE_SAAS", "ON_PREMISE"]),
    periodStart: z.string().min(1, "required"),
    periodEnd: z.string().min(1, "required"),
    amount: z
      .string()
      .optional()
      .refine(
        (value) => !value || /^\d+$/.test(value),
        "wholeNumber",
      ),
    notes: z.string(),
  })
  .refine(
    (values) => new Date(values.periodEnd) >= new Date(values.periodStart),
    { message: "endBeforeStart", path: ["periodEnd"] },
  );
export interface CreateAgreementFormValues {
  tenant: TenantDirectoryEntry | null;
  kind: "ENTERPRISE_SAAS" | "ON_PREMISE";
  periodStart: string;
  periodEnd: string;
  amount?: string;
  notes: string;
}


export interface ActionDialogFormValues {
  value: string;
}

// ─── Billing settings of the admin desk ──────────────────────────────────────

export interface AdminPayeeDetails {
  payeeName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  mobileMoneyNumber: string | null;
  mobileMoneyOperator: string | null;
  bankDetails: string | null;
}

export interface AdminSubscriptionPlanOption {
  name: string;
  includedPeople: number;
  /** Null when the plan has no people cap. */
  maxPeople: number | null;
  monthly: AdminPriceList;
  /** Null when the plan takes no one beyond its included people. */
  extraPerson: AdminPriceList | null;
}

export interface AdminBillingSettingsView {
  currency: string;
  payee: AdminPayeeDetails;
  tiers: AdminTierOption[];
  subscriptionPlans: AdminSubscriptionPlanOption[];
  managedInDatabase: boolean;
}

const amount = z.coerce.number().int("wholeNumber").nonnegative("nonNegative");
const priceListSchema = z.object({ gnf: amount, fcfa: amount, usdCents: amount });

export const adminBillingSettingsSchema = z.object({
  payee: z.object({
    payeeName: z.string().trim().max(120, "tooLong"),
    contactEmail: z
      .string()
      .trim()
      .refine((value) => !value || z.string().email().safeParse(value).success, {
        message: "email",
      }),
    contactPhone: z.string().trim().max(40, "tooLong"),
    mobileMoneyNumber: z.string().trim().max(40, "tooLong"),
    mobileMoneyOperator: z.string().trim().max(40, "tooLong"),
    bankDetails: z.string().max(2000, "tooLong"),
  }),
  tiers: z
    .array(
      z.object({
        name: z.string().trim().min(1, "required").max(40, "tooLong"),
        maxGuests: z.coerce.number().int("wholeNumber").positive("positive"),
        price: priceListSchema,
      }),
    )
    .min(1, "atLeastOneTier"),
  subscriptionPlans: z
    .array(
      z.object({
        name: z.string().trim().min(1, "required").max(40, "tooLong"),
        includedPeople: z.coerce.number().int("wholeNumber").positive("positive"),
        /** Empty means no cap. */
        maxPeople: z.string().trim().regex(/^\d*$/, "wholeNumberOrEmpty"),
        monthly: priceListSchema,
        /** All zero means the plan takes no one beyond its included people. */
        extraPerson: priceListSchema,
      }),
    )
    .min(1, "atLeastOnePlan"),
});
export type AdminBillingSettingsFormValues = z.infer<typeof adminBillingSettingsSchema>;

// ─── Organizer feedback (JIKU-133) ────────────────────────────────────────────

export type FeedbackEntry = Required<components["schemas"]["FeedbackView"]>;
export type RatingSummary = Required<components["schemas"]["RatingSummary"]>;

export interface FeedbackPage {
  items: FeedbackEntry[];
  total: number;
  page: number;
  size: number;
}

export const FEEDBACK_STATUSES = ["NEW", "IN_PROGRESS", "ANSWERED", "CLOSED"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];
