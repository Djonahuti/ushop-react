"use client"

import {
  UserCircleIcon,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOutIcon,
  BadgeCheck,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { apiGet } from "@/lib/api"
import { useEffect, useState } from "react"
import { Admin } from "@/types"
import { Link } from "react-router-dom"

export function NavUser() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useSidebar();

  useEffect(() => {
    const fetchAdminData = async () => {
      const email = localStorage.getItem('auth_email');
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        const admins = await apiGet<any[]>(`/admins.php?email=${encodeURIComponent(email)}`);
        if (admins && admins.length > 0) {
          setAdmin(admins[0]);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
      setLoading(false);
    };

    fetchAdminData();
  }, []);

    if (loading){
      return(
        <div className="fixed inset-0 z-50 flex items-center justify-center my-nav">
          <img
            src="/logo/ushop-small.svg"
            alt="logo"
            className="animate-bounce"
          />
        </div>      
      )
    }

  if (!admin) {
    return <div>No admin data found.</div>;
  }

  const handleLogout = async () => {
    localStorage.removeItem('auth_email');
    localStorage.removeItem('auth_role');
    window.location.href = "/login"
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-full">
                {admin.admin_image ? (
                <AvatarImage
                 src={`/${admin.admin_image}`}
                 alt={admin.admin_name} />
                ):(
                  <AvatarFallback className="rounded-full">{admin.admin_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{admin.admin_name}</span>
                <span className="truncate text-xs">{admin.admin_email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-full grayscale">
                {admin.admin_image ? (
                <AvatarImage
                 src={`/${admin.admin_image}`} 
                 alt={admin.admin_name} />
                ):(
                  <AvatarFallback className="rounded-full">{admin.admin_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{admin.admin_name}</span>
                  <span className="truncate text-xs">{admin.admin_email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Administrator
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            <DropdownMenuItem>
                <Link to="/account" className="flex justify-between gap-2">
                <UserCircleIcon />Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
            <button onClick={handleLogout} className="flex space-x-0 w-full text-left cursor-pointer">
              <LogOutIcon />
              Log out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
