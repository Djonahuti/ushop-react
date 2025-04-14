"use client"

import {
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
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
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import supabase from "@/lib/supabaseClient"
import { Admin } from "@/types"


export function NavUser() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useSidebar();
  
    useEffect(() => {
      const fetchAdminData = async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
  
        if (user) {
          const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('admin_email', user.email)
            .single();
  
          if (error) {
            console.error('Error fetching admin data:', error.message);
          } else {
            setAdmin(data);
          }
        } else if (userError) {
          console.error('Error getting user:', userError.message);
        }
        setLoading(false);
      };
  
      fetchAdminData();
    }, []);
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    if (!admin) {
      return <div>No admin data found.</div>;
    }
  
    const handleLogout = async () => {
      await supabase.auth.signOut()
      window.location.href = "/admin-login"
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
              <Avatar className="h-8 w-8 rounded-lg">
                {admin.admin_image ? (
                <AvatarImage
                 src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${admin.admin_image}`}
                 alt={admin.admin_name}
                 className="rounded-full" 
                 />
                ):(
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{admin.admin_name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {admin.admin_email}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
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
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                {admin.admin_image ? (
                <AvatarImage
                 src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${admin.admin_image}`} 
                 alt={admin.admin_name}
                 className="rounded-full" 
                 />
                ):(
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{admin.admin_name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {admin.admin_email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link to="/account" className="flex justify-between gap-2">
                <UserCircleIcon />Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
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