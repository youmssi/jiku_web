import { redirect } from "next/navigation";
import { AccountMenu } from "@/components/shared/account-menu";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { OrgSwitcher } from "@/components/modules/identity";
import { getOrganizerContext } from "@/components/modules/identity/organizer-context";
import { ROUTES } from "@/lib/constants";

/**
 * Nav strategy (see docs/jiku-mvp-audit-report.md navigation decision): a
 * persistent sidebar on desktop/tablet (>= md), a fixed bottom tab bar on
 * phone-sized screens. Both read the same ORGANIZER_NAV_ITEMS list. The
 * sidebar's own hamburger drawer is desktop-only here (collapse/expand, not
 * mobile access) since BottomNav covers phone navigation instead.
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

  return (
    <SidebarProvider>
      <AppSidebar
        brandName={context.brandName}
        logoUrl={context.logoUrl}
        role={context.role}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="hidden md:inline-flex" />
          <Separator orientation="vertical" className="hidden h-5 md:block" />
          {context.memberships.length > 1 ? (
            <OrgSwitcher
              memberships={context.memberships}
              activeTenantId={context.activeTenantId}
            />
          ) : (
            <span className="text-sm font-medium">{context.brandName}</span>
          )}
          <div className="ml-auto md:hidden">
            <AccountMenu
              brandName={context.brandName}
              logoUrl={context.logoUrl}
              role={context.role}
              variant="compact"
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col pb-16 md:pb-0">{children}</div>
      </SidebarInset>
      <BottomNav />
    </SidebarProvider>
  );
}
