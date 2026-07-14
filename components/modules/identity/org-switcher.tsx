"use client";

import { Building2, Check, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/constants";
import { switchOrgAction } from "@/components/modules/identity/identity.service";
import type { Membership } from "@/components/modules/identity/schema";

interface OrgSwitcherProps {
  memberships: Membership[];
  activeTenantId: string;
}

/**
 * Organization switcher (JIKU-48). Rendered in the app header only when the
 * user belongs to more than one organization; switching re-binds the session
 * server-side and lands back on the dashboard of the selected org.
 */
export function OrgSwitcher({ memberships, activeTenantId }: OrgSwitcherProps) {
  const [switching, setSwitching] = useState(false);
  const active = memberships.find((m) => m.tenantId === activeTenantId);

  async function switchTo(tenantId: string) {
    if (tenantId === activeTenantId) {
      return;
    }
    setSwitching(true);
    await switchOrgAction(tenantId);
    setSwitching(false);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" disabled={switching}>
          <Building2 className="size-4" />
          <span className="max-w-40 truncate text-sm font-medium">
            {active?.tenantName ?? "Organization"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuLabel>Your organizations</DropdownMenuLabel>
        {memberships.map((membership) => (
          <DropdownMenuItem
            key={membership.tenantId}
            onSelect={() => void switchTo(membership.tenantId)}
          >
            <span className="flex-1 truncate">{membership.tenantName}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {membership.role.toLowerCase()}
            </span>
            {membership.tenantId === activeTenantId ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={ROUTES.ONBOARDING}>
            <Plus className="size-4" />
            New organization
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
