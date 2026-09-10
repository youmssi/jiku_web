"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { LogoutIcon } from "@hugeicons/core-free-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link, usePathname } from "@/i18n/navigation";
import { ADMIN_ROUTES } from "@/lib/constants";
import { adminLogoutAction } from "./admin.service";
import { ADMIN_NAV_GROUPS } from "./admin-nav";

/**
 * Back-office shell following the shadcn sidebar-07 template structure: brand
 * in the header, grouped navigation in the content, sign-out in the footer,
 * and a rail. Desktop collapses to icons; below `md` the sidebar renders in a
 * Sheet. The visual language stays deliberately sober against the organizer
 * app — this surface is for the operating team only.
 */
export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Jikū admin">
              <Link href={ADMIN_ROUTES.TENANTS}>
                <JikūLogo variant="mark" className="size-5 rounded-md" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Jikū</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Admin
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavGroups />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={adminLogoutAction} className="w-full">
              <SidebarMenuButton
                asChild
                tooltip="Sign out"
                className="text-muted-foreground"
              >
                <button type="submit">
                  <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
                  <span>Sign out</span>
                </button>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function AdminNavGroups() {
  const pathname = usePathname();

  return (
    <>
      {ADMIN_NAV_GROUPS.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    isActive={item.match(pathname)}
                  >
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
