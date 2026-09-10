import { redirect } from "next/navigation";
import { AppBreadcrumb, AppSidebar, type SidebarProject } from "@/components/modules/dashboard";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getOrganizerContext } from "@/components/modules/identity/organizer-context";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";

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
    redirect(ROUTES.LOGIN);
  }
  // A fresh account has no organization yet — onboarding creates the first one.
  if (!context.activeTenantId) {
    redirect(ROUTES.ONBOARDING);
  }

  const projects = await loadRecentEvents();

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
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <AppBreadcrumb brandName={context.brandName} />
            </div>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
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
    url: `/events/${event.id}/dashboard`,
  }));
}
