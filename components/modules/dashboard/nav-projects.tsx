"use client"

import { CalendarDays } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalCircle01Icon, FolderIcon, ArrowRightIcon } from "@hugeicons/core-free-icons"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import type { SidebarProject } from "./app-sidebar"

/**
 * Quick-access events (sidebar-07 "projects" slot): the organizer's most recent
 * events with per-item actions (open the overview, open guests). Hidden when the
 * sidebar collapses to icons, exactly like the template.
 */
export function NavProjects({ projects }: { projects: SidebarProject[] }) {
  const { isMobile } = useSidebar()
  const t = useTranslations("shell.sidebar")

  if (projects.length === 0) {
    return null
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t("recentEvents")}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <CalendarDays />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="aria-expanded:bg-muted"
                >
                  <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
                  <span className="sr-only">{t("more")}</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-fit"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem asChild>
                  <Link href={item.url}>
                    <HugeiconsIcon icon={FolderIcon} strokeWidth={2} />
                    <span>{t("openOverview")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`${item.url}/guests`}>
                    <HugeiconsIcon icon={ArrowRightIcon} strokeWidth={2} />
                    <span>{t("openGuests")}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
