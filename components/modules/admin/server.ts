// Admin module — server-only public surface: the desk's page reads, for
// Server Components. They are never Server Actions, so no client can call them.
import "server-only";

export {
  loadAgreements,
  loadAudit,
  loadBillingSettings,
  loadPayments,
  loadProspects,
  loadTenantDirectory,
  loadTrials,
  loadWhatsApp,
  requireAdminSession,
} from "./admin.queries";
