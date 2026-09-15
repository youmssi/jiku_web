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
export interface AdminTierOption {
  name: string;
  maxGuests: number;
  priceMinor: number;
}

export interface AdminTierCatalog {
  currency: string;
  tiers: AdminTierOption[];
}

export interface AdminTrial {
  id: string;
  tenantId: string;
  eventId: string;
  tier: string;
  grantedAllowance: number;
  expiresAt: string;
  status: string;
  endedReason: string | null;
  createdAt: string;
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

export interface AdminBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  eventDate: string;
  guestCountEstimate: number;
  tier: string;
  currency: string;
  totalAmountMinor: number;
  depositAmountMinor: number;
  balanceAmountMinor: number;
  balanceDueDate: string;
  status: string;
  tenantId: string | null;
  eventId: string | null;
  acquisitionSource: string | null;
  createdAt: string;
}

export interface AdminBookingPaymentDeclaration {
  id: string;
  bookingId: string;
  customerName: string;
  amountMinor: number;
  currency: string;
  kind: string;
  operator: string;
  transactionReference: string;
  declaredAt: string;
  verificationStatus: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
}

/** Remboursement exécuté contre l'acompte d'origine (JIKU-75). */
export interface AdminBookingRefund {
  id: string;
  bookingId: string;
  amountMinor: number;
  currency: string;
  reason: string;
  creditNoteNumber: string | null;
  status: string;
}

export interface RefundBookingRequest {
  amountMinor: number;
  reason: string;
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
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});
export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export const grantTrialSchema = z.object({
  tenant: z
    .union([adminTenantReferenceSchema, z.null()])
    .refine((tenant) => tenant !== null, "Pick an organization first."),
  eventId: z.string().trim().uuid("Enter a valid event id."),
  tier: z.string().min(1, "Pick a tier."),
  expiresAt: z
    .string()
    .min(1, "Set an expiry date.")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Enter a valid expiry date.",
    )
    .refine(
      (value) => new Date(value).getTime() > Date.now(),
      "The expiry must be in the future.",
    ),
});
export interface GrantTrialFormValues {
  tenant: TenantDirectoryEntry | null;
  eventId: string;
  tier: string;
  expiresAt: string;
}

export const createAgreementSchema = z
  .object({
    tenant: z
      .union([adminTenantReferenceSchema, z.null()])
      .refine((tenant) => tenant !== null, "Pick an organization first."),
    kind: z.enum(["ENTERPRISE_SAAS", "ON_PREMISE"]),
    periodStart: z.string().min(1, "Set a start date."),
    periodEnd: z.string().min(1, "Set an end date."),
    amount: z
      .string()
      .optional()
      .refine(
        (value) => !value || /^\d+$/.test(value),
        "Enter a whole amount.",
      ),
    notes: z.string(),
  })
  .refine(
    (values) => new Date(values.periodEnd) >= new Date(values.periodStart),
    { message: "The period must end after it starts.", path: ["periodEnd"] },
  );
export interface CreateAgreementFormValues {
  tenant: TenantDirectoryEntry | null;
  kind: "ENTERPRISE_SAAS" | "ON_PREMISE";
  periodStart: string;
  periodEnd: string;
  amount?: string;
  notes: string;
}

export const refundBookingSchema = z.object({
  amountMinor: z.coerce
    .number()
    .int("Enter a whole amount.")
    .positive("Enter a positive amount."),
  reason: z.string().trim().min(1, "A refund reason is required."),
});
export type RefundBookingFormValues = z.infer<typeof refundBookingSchema>;

export interface ActionDialogFormValues {
  value: string;
}

// ─── Réglages de facturation du bureau admin ─────────────────────────────────

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
  maxResources: number;
  priceMinorPerMonth: number;
}

export interface AdminBillingSettingsView {
  currency: string;
  payee: AdminPayeeDetails;
  tiers: AdminTierOption[];
  subscriptionPlans: AdminSubscriptionPlanOption[];
  managedInDatabase: boolean;
}

export const adminBillingSettingsSchema = z.object({
  payee: z.object({
    payeeName: z.string().trim().max(120, "Keep the name under 120 characters."),
    contactEmail: z
      .string()
      .trim()
      .refine((value) => !value || z.string().email().safeParse(value).success, {
        message: "Enter a valid email or leave it empty.",
      }),
    contactPhone: z.string().trim().max(40, "Keep the phone under 40 characters."),
    mobileMoneyNumber: z.string().trim().max(40, "Keep the number under 40 characters."),
    mobileMoneyOperator: z.string().trim().max(40, "Keep the operator under 40 characters."),
    bankDetails: z.string().max(2000, "Keep the bank details under 2000 characters."),
  }),
  tiers: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Tier name is required.").max(40),
        maxGuests: z.coerce.number().int().positive("Guests must be a positive number."),
        priceMinor: z.coerce.number().int().nonnegative("Price must be zero or more."),
      }),
    )
    .min(1, "At least one tier is required."),
  subscriptionPlans: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Plan name is required.").max(40),
        maxResources: z.coerce.number().int().positive("Resources must be a positive number."),
        priceMinorPerMonth: z.coerce.number().int().nonnegative("Price must be zero or more."),
      }),
    )
    .min(1, "At least one subscription plan is required."),
});
export type AdminBillingSettingsFormValues = z.infer<typeof adminBillingSettingsSchema>;
