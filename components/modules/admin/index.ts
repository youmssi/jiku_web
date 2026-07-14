// Admin module — platform back-office: tenants, payments desk, trials, agreements, audit (JIKU-46).
export { AdminLoginForm } from "./admin-login-form";
export { TenantsView } from "./tenants-view";
export { PaymentsView } from "./payments-view";
export { TrialsView } from "./trials-view";
export { AgreementsView } from "./agreements-view";
export { AuditView } from "./audit-view";
export { adminLogoutAction } from "./admin.service";
export type {
  AdminAgreement,
  AdminPayment,
  AdminTrial,
  AuditEntry,
  AuditPage,
  TenantDirectoryEntry,
  TenantDirectoryPage,
} from "./schema";
