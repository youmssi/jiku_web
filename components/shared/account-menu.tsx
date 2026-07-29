"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, LogOut, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { organizerInitials, organizerRoleLabel } from "@/components/shared/organizer-nav";
import { logoutAction, switchOrgAction } from "@/components/modules/identity";
import type { Membership } from "@/components/modules/identity";
import { ROUTES } from "@/lib/constants";

interface AccountMenuProps {
  brandName: string;
  logoUrl?: string | null;
  role: string;
  memberships: Membership[];
  activeTenantId: string;
  /** Compact renders as an icon-only avatar trigger, for the mobile header. */
  variant?: "full" | "compact";
}

/**
 * Account identity, organization switching and sign-out, all in one place —
 * shared between the desktop sidebar footer and the mobile header so there is
 * a single, consistently-placed identity control instead of a separate
 * org-switcher elsewhere in the chrome.
 */
export function AccountMenu({
  brandName,
  logoUrl,
  role,
  memberships,
  activeTenantId,
  variant = "full",
}: AccountMenuProps) {
  const [switching, setSwitching] = useState(false);

  async function switchTo(tenantId: string) {
    if (tenantId === activeTenantId || switching) {
      return;
    }
    setSwitching(true);
    await switchOrgAction(tenantId);
    setSwitching(false);
  }

  const identityLabel = (
    <DropdownMenuLabel className="font-normal">
      <span className="block text-sm font-medium">{brandName}</span>
      <span className="block text-xs text-muted-foreground capitalize">
        {organizerRoleLabel(role)}
      </span>
    </DropdownMenuLabel>
  );

  const orgSection =
    memberships.length > 1 ? (
      <>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Your organizations</DropdownMenuLabel>
        {memberships.map((membership) => (
          <DropdownMenuItem
            key={membership.tenantId}
            disabled={switching}
            onSelect={() => void switchTo(membership.tenantId)}
          >
            <span className="flex-1 truncate">{membership.tenantName}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {membership.role.toLowerCase()}
            </span>
            {membership.tenantId === activeTenantId ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </>
    ) : null;

  const newOrgItem = (
    <DropdownMenuItem asChild>
      <a href={ROUTES.ONBOARDING}>
        <Plus className="size-4" />
        New organization
      </a>
    </DropdownMenuItem>
  );

  const signOut = (
    <form action={logoutAction}>
      <DropdownMenuItem asChild>
        <button type="submit" className="w-full">
          <LogOut />
          Sign out
        </button>
      </DropdownMenuItem>
    </form>
  );

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Account menu">
            <Avatar className="size-7 rounded-md">
              {logoUrl ? <AvatarImage src={logoUrl} alt={brandName} /> : null}
              <AvatarFallback className="rounded-md text-[0.65rem]">
                {organizerInitials(brandName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="min-w-56">
          {identityLabel}
          {orgSection}
          <DropdownMenuSeparator />
          {newOrgItem}
          {signOut}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-2 px-2 py-1.5 data-[state=open]:bg-sidebar-accent"
        >
          <Avatar className="size-8 rounded-md">
            {logoUrl ? <AvatarImage src={logoUrl} alt={brandName} /> : null}
            <AvatarFallback className="rounded-md">{organizerInitials(brandName)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-sm font-medium">{brandName}</span>
            <span className="truncate text-xs text-muted-foreground capitalize">
              {organizerRoleLabel(role)}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="min-w-56">
        {identityLabel}
        {orgSection}
        <DropdownMenuSeparator />
        {newOrgItem}
        {signOut}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
