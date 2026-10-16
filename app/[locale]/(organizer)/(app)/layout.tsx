import { localeRedirect } from "@/i18n/redirect";
import { AppBreadcrumb, AppSidebar, type SidebarProject } from "@/components/modules/dashboard";
import { RatingPrompt } from "@/components/modules/feedback";
import { NavCommandPalette } from "@/components/shared";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BillingAttentionBanner, loadBillingStatus } from "@/components/modules/billing/server";
import { ConfirmEmailBanner } from "@/components/modules/identity";
import { getOrganizerContext } from "@/components/modules/identity/server";
import { serverFetch } from "@/lib/api-server";
import { eventRoute, ROUTES } from "@/lib/constants";

/** Roles that manage billing and so get the way to act on its reminder. */
const BILLING_ROLES = ["ORGANIZER_OWNER", "ORGANIZER_ADMIN"];

/**
 * Authenticated organizer app shell, mirroring the shadcn sidebar-07 dashboard
 * layout: a collapsible sidebar (icons on desktop, a Sheet below `md`) plus a
 * header with the sidebar trigger and a breadcrumb. The previous bottom tab bar
 * is gone — mobile navigation is the sidebar's sheet.
 */
export default async function OrganizerAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const context = await getOrganizerContext();
  if (!context) {
    return localeRedirect(ROUTES.LOGIN);
  }
  // A fresh account has no organization yet — onboarding creates the first one.
  if (!context.activeTenantId) {
    return localeRedirect(ROUTES.ONBOARDING);
  }

  const [projects, billing] = await Promise.all([loadRecentEvents(), loadBillingStatus()]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          brandName={context.brandName}
          logoUrl={context.logoUrl}
          role={context.role}
          fullName={context.fullName}
          email={context.email}
          memberships={context.memberships}
          activeTenantId={context.activeTenantId}
          projects={projects}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 max-md:size-11" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <AppBreadcrumb brandName={context.brandName} />
            </div>
            <div className="ml-auto flex items-center px-4">
              <NavCommandPalette variant="organizer" />
            </div>
          </header>
          {billing && billing.attention !== "NONE" ? (
            <div className="px-4 pb-2">
              <BillingAttentionBanner status={billing} canManage={BILLING_ROLES.includes(context.role)} />
            </div>
          ) : null}
          {context.emailVerified ? null : (
            <div className="px-4 pb-2">
              <ConfirmEmailBanner email={context.email} />
            </div>
          )}
          <div className="flex flex-1 flex-col pb-24 md:pb-16">{children}</div>
        </SidebarInset>
        <RatingPrompt />
      </SidebarProvider>
    </TooltipProvider>
  );
}

/** The most recent events, surfaced as quick-access items in the sidebar. */
async function loadRecentEvents(): Promise<SidebarProject[]> {
  const response = await serverFetch("/events");
  if (!response.ok) {
    return [];
  }
  const events = (await response.json().catch(() => [])) as {
    id: string;
    name: string;
  }[];
  return events.slice(0, 4).map((event) => ({
    name: event.name,
    url: eventRoute(event.id),
  }));
}
