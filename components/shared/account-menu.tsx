"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
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
import { logoutAction } from "@/components/modules/identity";

interface AccountMenuProps {
  brandName: string;
  logoUrl?: string | null;
  role: string;
  /** Compact renders as an icon-only avatar trigger, for the mobile header. */
  variant?: "full" | "compact";
}

/** Account identity + sign-out, shared between the desktop sidebar footer and the mobile header. */
export function AccountMenu({ brandName, logoUrl, role, variant = "full" }: AccountMenuProps) {
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
          <DropdownMenuLabel className="font-normal">
            <span className="block text-sm font-medium">{brandName}</span>
            <span className="block text-xs text-muted-foreground capitalize">
              {organizerRoleLabel(role)}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
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
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium">{brandName}</span>
          <span className="block text-xs text-muted-foreground capitalize">
            {organizerRoleLabel(role)}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {signOut}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
