"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChevronsUpDown, LayoutDashboard, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/sidebar";
import { ROUTES } from "@/lib/constants";
import { logoutAction } from "@/components/modules/identity";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  match: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    match: (pathname) => pathname === ROUTES.DASHBOARD,
  },
  {
    label: "Events",
    href: ROUTES.EVENTS,
    icon: CalendarDays,
    match: (pathname) => pathname === ROUTES.EVENTS || pathname.startsWith(`${ROUTES.EVENTS}/`),
  },
];

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "J"
  );
}

function roleLabel(role: string): string {
  return role.toLowerCase().replace(/_/g, " ");
}

interface AppSidebarProps {
  brandName: string;
  logoUrl?: string | null;
  role: string;
}

export function AppSidebar({ brandName, logoUrl, role }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="size-8 rounded-md">
            {logoUrl ? <AvatarImage src={logoUrl} alt={brandName} /> : null}
            <AvatarFallback className="rounded-md">{initials(brandName)}</AvatarFallback>
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
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.match(pathname)}
                      tooltip={item.label}
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="size-8 rounded-md">
                    {logoUrl ? <AvatarImage src={logoUrl} alt={brandName} /> : null}
                    <AvatarFallback className="rounded-md">
                      {initials(brandName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">{brandName}</span>
                    <span className="truncate text-xs text-muted-foreground capitalize">
                      {roleLabel(role)}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
              >
                <DropdownMenuLabel className="font-normal">
                  <span className="block text-sm font-medium">{brandName}</span>
                  <span className="block text-xs text-muted-foreground capitalize">
                    {roleLabel(role)}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <form action={logoutAction}>
                  <DropdownMenuItem asChild>
                    <button type="submit" className="w-full">
                      <LogOut />
                      Sign out
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
