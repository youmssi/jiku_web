"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { AccountMenu } from "@/components/shared/account-menu";
import {
  currentEventId,
  EVENT_SUB_NAV_ITEMS,
  ORGANIZER_NAV_ITEMS,
  organizerInitials,
} from "@/components/shared/organizer-nav";
import { ROUTES } from "@/lib/constants";

interface AppSidebarProps {
  brandName: string;
  logoUrl?: string | null;
  role: string;
}

/** Desktop navigation chrome; collapses to a Sheet drawer below `md` (see AGENTS.md nav decision: mobile uses BottomNav instead). */
export function AppSidebar({ brandName, logoUrl, role }: AppSidebarProps) {
  const pathname = usePathname();
  const eventId = currentEventId(pathname);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="size-8 rounded-md">
            {logoUrl ? <AvatarImage src={logoUrl} alt={brandName} /> : null}
            <AvatarFallback className="rounded-md">{organizerInitials(brandName)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 leading-tight">
            <span className="truncate text-sm font-semibold">{brandName}</span>
            <span className="truncate text-xs text-muted-foreground">Jikū</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {ORGANIZER_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isEventsItem = item.href === ROUTES.EVENTS;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.match(pathname) || (isEventsItem && eventId !== null)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>

                    {isEventsItem && eventId !== null && (
                      <SidebarMenuSub>
                        {EVENT_SUB_NAV_ITEMS.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <SidebarMenuSubItem key={subItem.label}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={subItem.match(pathname, eventId)}
                              >
                                <Link href={subItem.href(eventId)}>
                                  <SubIcon />
                                  <span>{subItem.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AccountMenu brandName={brandName} logoUrl={logoUrl} role={role} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
