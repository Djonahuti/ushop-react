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
import { apiGet } from "@/lib/api"
import { Customer } from "@/types"


export function NavUser() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useSidebar();
  
    useEffect(() => {
      const fetchCustomerData = async () => {
        const email = localStorage.getItem('auth_email');
        if (!email) {
          setLoading(false);
          return;
        }

        try {
          const customers = await apiGet<Customer[]>(`/customers.php?email=${encodeURIComponent(email)}`);
          if (customers && customers.length > 0) {
            setCustomer(customers[0]);
          }
        } catch (error) {
          console.error('Error fetching customer data:', error);
        }
        setLoading(false);
      };
  
      fetchCustomerData();
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
  
    if (!customer) {
      return <div>No customer data found.</div>;
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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full">
                {customer.customer_image ? (
                <AvatarImage
                 src={`/${customer.customer_image}`}
                 alt={customer.customer_name}
                 className="rounded-full" 
                 />
                ):(
                  <AvatarFallback className="rounded-full">{customer.customer_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{customer.customer_name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {customer.customer_email}
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
                <Avatar className="h-8 w-8 rounded-full grayscale">
                {customer.customer_image ? (
                <AvatarImage
                 src={`/${customer.customer_image}`} 
                 alt={customer.customer_name}
                 className="rounded-full" 
                 />
                ):(
                  <AvatarFallback className="rounded-full">{customer.customer_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{customer.customer_name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {customer.customer_email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link to="/profile" className="flex justify-between gap-2">
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