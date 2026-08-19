// CONTRACT — types mirroring the backend platform-admin API (JIKU-40/41/42/43).

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
