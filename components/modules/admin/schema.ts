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
