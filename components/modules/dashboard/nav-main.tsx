"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Link, usePathname } from "@/i18n/navigation"
import {
  currentEventId,
  currentServiceId,
  EVENT_SUB_NAV_ITEMS,
  ORGANIZER_NAV_ITEMS,
  SERVICE_SUB_NAV_ITEMS,
} from "@/components/shared/organizer-nav"
import { ROUTES } from "@/lib/constants"

/**
 * Primary navigation (sidebar-07 "nav main" slot): one collapsible section per
 * top-level destination. "Events" and "Services" carry the per-item views as a
 * sub-menu whenever an event or a service is open; the other destinations are
 * plain links.
 */
export function NavMain() {
  const pathname = usePathname()
  const eventId = currentEventId(pathname)
  const serviceId = currentServiceId(pathname)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {ORGANIZER_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const subItems =
            item.href === ROUTES.EVENTS && eventId
              ? EVENT_SUB_NAV_ITEMS.map((subItem) => ({
                  title: subItem.label,
                  url: subItem.href(eventId),
                }))
              : item.href === ROUTES.SERVICES && serviceId
                ? SERVICE_SUB_NAV_ITEMS.map((subItem) => ({
                    title: subItem.label,
                    url: subItem.href(serviceId),
                  }))
                : []

          if (subItems.length === 0) {
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
            )
          }

          return (
            <Collapsible
              key={item.href}
              asChild
              defaultOpen
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.label} isActive={item.match(pathname)}>
                    <Icon />
                    <span>{item.label}</span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2}
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {subItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.url}
                        >
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
