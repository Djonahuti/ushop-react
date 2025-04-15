
import * as React from "react"
import {
  Bell,
  Truck,
  Inbox,
  MoreHorizontal,
  PersonStanding,
  Scale,
  Cog,
  Blocks,
  ShoppingBag,
  User2,
  Database,
  LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Admin } from "@/types"
import supabase from "@/lib/supabaseClient"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const data = [
  [
    {
      label: "Inbox",
      icon: Inbox,
      url: "/inbox",
    },
    {
      label: "Customer Login",
      icon: User2,
      url: "/login",
    },
    {
      label: "Seller Login",
      icon: ShoppingBag,
      url: "*",
    },    
  ],
  [
    {
      label: "Product Management",
      icon: Blocks,
      url: "/view-products",
    },
    {
      label: "Order Management",
      icon: Truck,
      url: "/view-orders",
    },
    {
      label: "DBMS",
      icon: Database,
      url: "/database",
    },    
  ],
  [
    {
      label: "Settings",
      icon: Cog,
      url: "/account",
    },
    {
      label: "Accessibily",
      icon: PersonStanding,
      url: "/account",
    },
    {
      label: "Penalties Information",
      icon: Scale,
      url: "*",
    },
    {
      label: "Notifications",
      icon: Bell,
      url: "/inbox",
    },   
  ],
]

export function PopRight() {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setIsOpen(true)
  }, []);

  const [admin, setAdmin] = React.useState<Admin | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
    window.location.href = "/login"
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        {admin.admin_email}
      </div>
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
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 data-[state=open]:bg-accent"
          >
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton>
                          <a href={item.url} className="flex items-center gap-2">
                            <item.icon /> <span>{item.label}</span>
                          </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
              <SidebarGroup className="border-b last:border-none">
                <SidebarGroupContent className="gap-0">
                  <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-2">
                          <LogOut /> <span>Log Out</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  )
}
