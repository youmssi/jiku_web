"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { UnfoldMoreIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Link } from "@/i18n/navigation"
import { switchOrgAction, type Membership } from "@/components/modules/identity"
import { useTranslations } from "next-intl"
import { organizerInitials } from "@/components/shared/organizer-nav"
import { useRoleLabel } from "@/components/shared/use-role-label"
import { ROUTES } from "@/lib/constants"

interface TeamSwitcherProps {
  brandName: string
  logoUrl?: string | null
  role: string
  memberships: Membership[]
  activeTenantId: string
}

/**
 * Organization switcher (sidebar-07 "team switcher" slot): lists every
 * organization the organizer belongs to, rebinds the session on selection, and
 * offers a "new organization" entry point.
 */
export function TeamSwitcher({
  brandName,
  logoUrl,
  role,
  memberships,
  activeTenantId,
}: TeamSwitcherProps) {
  const { isMobile } = useSidebar()
  const [switching, setSwitching] = React.useState(false)
  const t = useTranslations("shell.organizations")
  const roleLabel = useRoleLabel()

  const active = memberships.find((m) => m.tenantId === activeTenantId)
  const activeLabel = active?.tenantName ?? brandName
  const activeRole = roleLabel(active?.role ?? role)

  async function switchTo(tenantId: string) {
    if (tenantId === activeTenantId || switching) {
      return
    }
    setSwitching(true)
    await switchOrgAction(tenantId)
    setSwitching(false)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-md">
                {logoUrl ? <AvatarImage src={logoUrl} alt={activeLabel} /> : null}
                <AvatarFallback className="rounded-md text-xs">
                  {organizerInitials(activeLabel)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeLabel}</span>
                <span className="truncate text-xs">{activeRole}</span>
              </div>
              <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t("yours")}
            </DropdownMenuLabel>
            {memberships.map((membership) => (
              <DropdownMenuItem
                key={membership.tenantId}
                disabled={switching}
                onSelect={() => void switchTo(membership.tenantId)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background text-[0.6rem] font-semibold text-muted-foreground">
                  {organizerInitials(membership.tenantName)}
                </div>
                <span className="flex-1 truncate">{membership.tenantName}</span>
                <span className="text-xs text-muted-foreground">
                  {roleLabel(membership.role)}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.ONBOARDING} className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">{t("new")}</div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
