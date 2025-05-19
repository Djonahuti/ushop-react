
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
  User2,
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
import { Seller } from "@/types"
import supabase from "@/lib/supabaseClient"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import ThemeToggle from "../ThemeToggle"

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
  ],
  [
    {
      label: "Product Management",
      icon: Blocks,
      url: "/sell-products",
    },
    {
      label: "Order Management",
      icon: Truck,
      url: "/orders-me",
    },    
  ],
  [
    {
      label: "Settings",
      icon: Cog,
      url: "/personalize",
    },
    {
      label: "Accessibily",
      icon: PersonStanding,
      url: "/personalize",
    },
    {
      label: "Penalties Information",
      icon: Scale,
      url: "*",
    },
    {
      label: "Notifications",
      icon: Bell,
      url: "/my-inbox",
    },   
  ],
]

export function SNavPop() {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setIsOpen(true)
  }, []);

  const [seller, setSeller] = React.useState<Seller | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSellerData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('seller_email', user.email)
          .single();

        if (error) {
          console.error('Error fetching seller data:', error.message);
        } else {
          setSeller(data);
        }
      } else if (userError) {
        console.error('Error getting user:', userError.message);
      }
      setLoading(false);
    };

    fetchSellerData();
  }, []);

    if (loading){
      return(
        <div className="fixed inset-0 z-50 flex items-center justify-center my-nav">
          <img
            src="/src/assets/ushop-small.svg"
            alt="logo"
            className="animate-bounce"
          />
        </div>      
      )
    }

  if (!seller) {
    return <div>No seller data found.</div>;
  }  

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        {seller.seller_email}
      </div>
      <Avatar className="h-8 w-8 rounded-lg">
        {seller.seller_image ? (
        <AvatarImage
         src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${seller.seller_image}`}
         alt={seller.seller_name}
         className="rounded-full" 
         />
        ):(
          <AvatarFallback className="rounded-lg">{seller.business_name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
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
      <div className="block md:hidden text-sm">
          <ThemeToggle />
      </div>      
    </div>
  )
}
