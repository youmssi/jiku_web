import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/modules/admin";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAdminAccessToken } from "@/lib/auth";
import { ADMIN_ROUTES } from "@/lib/constants";

export const metadata = { robots: { index: false } };

/**
 * Guarded back-office shell (JIKU-46), laid out after the shadcn sidebar-07
 * template: a collapsible sidebar (icons on desktop, a Sheet below `md`) plus
 * an inset header with the sidebar trigger. The cookie check is the cheap first
 * gate; every data fetch still runs against the PLATFORM_ADMIN-protected
 * endpoints, so a stale or forged cookie only ever reaches an empty, 403'd page.
 */
export default async function AdminAppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  if (!(await getAdminAccessToken())) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <span className="text-sm font-medium">Jikū admin</span>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-6 px-4 pb-8 md:px-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
