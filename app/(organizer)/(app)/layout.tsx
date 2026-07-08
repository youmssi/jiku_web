import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getOrganizerContext } from "@/components/modules/identity/organizer-context";
import { ROUTES } from "@/lib/constants";

export default async function OrganizerAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const context = await getOrganizerContext();
  if (!context) {
    redirect(ROUTES.LOGIN);
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
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm font-medium">{context.brandName}</span>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
