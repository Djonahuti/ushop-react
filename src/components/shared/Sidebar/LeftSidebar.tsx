

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "./NavMain"
import { NavDocuments } from "./NavDocuments"
import { NavSecondary } from "./NavSecondary"
import { NavUser } from "./NavUser"
import { CameraIcon, ClipboardListIcon, DatabaseIcon, FileCodeIcon, FileIcon, FileTextIcon, HelpCircleIcon, LayoutDashboardIcon, Package2, PackagePlus, PackageSearch, SearchIcon, SettingsIcon, User2, UsersRound } from "lucide-react"
import ThemeToggle from "../../ThemeToggle"

const navData = {
  user: {
    name: "Admin",
    email: "m@example.com",
    avatar: User2,
  },

  sidebarLinks: [
    {
      imgURL: LayoutDashboardIcon,
      route: "/dashboard",
      label: "Dashboard",
    },
    {
      imgURL: UsersRound,
      route: "/users",
      label: "Users",
    },
    {
      imgURL: PackagePlus,
      route: "/add-product",
      label: "Add Product",
    },
    {
      imgURL: PackageSearch,
      route: "/view-products",
      label: "Products",
    },
    {
      imgURL: Package2,
      route: "/view-orders",
      label: "Orders",
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

  navSecondary: [
    {
      imgURL: SettingsIcon,
      route: "#",
      label: "Settings",
    },
    {
      imgURL: HelpCircleIcon,
      route: "#",
      label: "Get Help",
    },
    {
      imgURL: SearchIcon,
      route: "#",
      label: "Search",
    },
  ],

  navDocuments: [
    {
      imgURL: DatabaseIcon,
      route: "/database",
      label: "Data Library",
    },
    {
      imgURL: ClipboardListIcon,
      route: "/feeds",
      label: "Feedbacks",
    },
    {
      imgURL: FileIcon,
      route: "#",
      label: "Word Assistant",
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
        <NavDocuments items={navData.navDocuments} />
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
