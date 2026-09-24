import { localeRedirect } from "@/i18n/redirect";
import { TrialsView } from "@/components/modules/admin";
import type {
  AdminTierCatalog,
  AdminTrialPage,
  AdminTrialStats,
} from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

const EMPTY_CATALOG: AdminTierCatalog = { currency: "", tiers: [] };
const TRIALS_PAGE_SIZE = 25;

const EMPTY_STATS: AdminTrialStats = {
  active: 0,
  expiringWithin7Days: 0,
  convertedThisMonth: 0,
  conversionRatePercent: null,
};

export default async function AdminTrialsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageIndex = Math.max(0, Number.parseInt(page ?? "0", 10) || 0);

  const [response, statsResponse, catalogResponse] = await Promise.all([
    adminFetch(`/admin/trials?page=${pageIndex}&size=${TRIALS_PAGE_SIZE}`),
    adminFetch("/admin/trials/stats"),
    adminFetch("/admin/billing/tiers"),
  ]);
  if (response.status === 401 || response.status === 403) {
    return localeRedirect(ADMIN_ROUTES.LOGIN);
  }
  const trialsPage = response.ok
    ? ((await response.json()) as AdminTrialPage)
    : { entries: [], total: 0, page: pageIndex, size: TRIALS_PAGE_SIZE };
  const stats = statsResponse.ok
    ? ((await statsResponse.json()) as AdminTrialStats)
    : EMPTY_STATS;
  const catalog = catalogResponse.ok
    ? ((await catalogResponse.json()) as AdminTierCatalog)
    : EMPTY_CATALOG;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Trials</h1>
      <TrialsView trialsPage={trialsPage} stats={stats} catalog={catalog} />
    </div>
  );
}
