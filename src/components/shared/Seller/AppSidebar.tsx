

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CameraIcon, FileCodeIcon, FileTextIcon, LayoutDashboardIcon, MessageCircleMore, Package2, PackagePlus, PackageSearch, User2 } from "lucide-react"
import ThemeToggle from "../../ThemeToggle"
import { NavMain } from "./MainNav"
import { NavUser } from "./UserNav"

const navData = {
  user: {
    name: "Seller",
    email: "m@example.com",
    avatar: User2,
  },

  sidebarLinks: [
    {
      imgURL: LayoutDashboardIcon,
      route: "/dashboard2",
      label: "Dashboard",
    },
    {
      imgURL: PackagePlus,
      route: "/sell-product",
      label: "Add Product",
    },
    {
      imgURL: PackageSearch,
      route: "/my-products",
      label: "Products",
    },
    {
      imgURL: Package2,
      route: "/orders-me",
      label: "Orders",
    },
    {
      imgURL: MessageCircleMore,
      route: "/sell-feeds",
      label: "Feedbacks",
    },
  ],

  navClouds: [
    {
      imgURL: CameraIcon,
      route: "#",
      isActive: true,
      label: "Capture",
      items: [
        {
          label: "Active Proposals",
          route: "#",
        },
        {
          label: "Archived",
          route: "#",
        },
      ],
    },
    {
      imgURL: FileTextIcon,
      route: "#",
      label: "Proposal",
      items: [
        {
          label: "Active Proposals",
          route: "#",
        },
        {
          label: "Archived",
          route: "#",
        },
      ],
    },
    {
      imgURL: FileCodeIcon,
      route: "#",
      label: "Prompts",
      items: [
        {
          label: "Active Proposals",
          route: "#",
        },
        {
          label: "Archived",
          route: "#",
        },
      ],
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
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
        <NavMain items={navData.sidebarLinks} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
