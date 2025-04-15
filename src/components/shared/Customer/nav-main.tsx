"use client"

import { Binoculars, Send, type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
//import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    toolTip: string
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
      <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Overview"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <Binoculars />
              <a href="/overview"><span>Overview</span></a>
            </SidebarMenuButton>
            <Link
              className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
              to="/contact"
            >
              <Send />
              <span className="sr-only">Contact us</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>        
        <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.toolTip}>
              <a href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
