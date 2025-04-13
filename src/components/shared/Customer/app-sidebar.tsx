"use client"

import * as React from "react"
import {
  HandCoins,
  Heart,
  MapPinned,
  MessageCircleMore,
  Package2,
  Receipt,
  UserCog,
} from "lucide-react"


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import ThemeToggle from "@/components/ThemeToggle"
import { NavUser } from "./nav-user"

// This is sample data.
const data = {
  navMain: [
    {
      title: "My Orders",
      url: "/my-orders",
      icon: Package2,
      isActive: true,
    },
    {
      title: "My Wishlist",
      url: "/wishlist",
      icon: Heart,
    },
    {
      title: "Payments",
      url: "#",
      icon: HandCoins,
    },
    {
      title: "Refund and Return",
      url: "#",
      icon: Receipt,
    },
    {
      title: "Feedback",
      url: "#",
      icon: MessageCircleMore,
    },
    {
      title: "Shipping Address",
      url: "#",
      icon: MapPinned,
    },
    {
      title: "Settings",
      url: "/profile",
      icon: UserCog,
      badge: "10",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
      <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/">
                <img
                  src="/src/assets/ushop.svg"
                  alt="logo"
                  width={85}
                  height={20}
                  />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
      <NavMain items={data.navMain} />        
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser />
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
