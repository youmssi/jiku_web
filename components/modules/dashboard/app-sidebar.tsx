"use client";

import * as React from "react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { Membership } from "@/components/modules/identity";

export interface SidebarProject {
  name: string;
  url: string;
}

export interface AppSidebarProps {
  brandName: string;
  logoUrl?: string | null;
  role: string;
  fullName: string | null;
  email: string;
  memberships: Membership[];
  activeTenantId: string;
  /** Quick-access items (the organizer's most recent events). */
  projects: SidebarProject[];
}

/**
 * The organizer app shell, following the shadcn sidebar-07 template structure:
 * organization switcher in the header, primary navigation + quick-access projects
 * in the content, the account in the footer, and a rail. Desktop collapses to
 * icons; below `md` the whole sidebar renders inside a Sheet.
 */
export function AppSidebar({
  brandName,
  logoUrl,
  role,
  fullName,
  email,
  memberships,
  activeTenantId,
  projects,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const user = {
    name: fullName ?? email,
    email,
    avatar: logoUrl ?? "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          brandName={brandName}
          logoUrl={logoUrl}
          role={role}
          memberships={memberships}
          activeTenantId={activeTenantId}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
