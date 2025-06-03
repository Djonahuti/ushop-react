"use client"

import * as React from "react"
import {
  ShoppingCart,
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
  useSidebar,
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
      toolTip: "My Order",
    },
    {
      title: "My Wishlist",
      url: "/wishlists",
      icon: Heart,
      toolTip: "My Wishlist",
    },
    {
      title: "Cart",
      url: "/my-cart",
      icon: ShoppingCart,
      toolTip: "Payment",
    },
    {
      title: "Refund and Return",
      url: "#",
      icon: Receipt,
      toolTip: "Refund & Return",
    },
    {
      title: "Feedbacks",
      url: "/feedbacks",
      icon: MessageCircleMore,
      toolTip: "Feedback",
    },
    {
      title: "Shipping Address",
      url: "#",
      icon: MapPinned,
      toolTip: "Shipping Address",
    },
    {
      title: "Settings",
      url: "/profile",
      icon: UserCog,
      toolTip: "Settings",
      badge: "10",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader>
      <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/">
                <img
                  src={
                    state === "collapsed" 
                    ? "/logo/ushop-small.svg" 
                    : "/logo/ushop.svg"
                  }
                  alt="logo"
                  width={state === "collapsed" ? 50 : 85}
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
