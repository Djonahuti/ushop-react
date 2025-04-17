
import * as React from "react"
import {
  Bell,
  BriefcaseBusiness,
  CircleHelp,
  Megaphone,
  MessageCircleQuestion,
  MoreHorizontal,
  PersonStanding,
  Scale,
  Cog,
  ShieldCheck,
  ShoppingBag,
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
import { Customer } from "@/types"
import supabase from "@/lib/supabaseClient"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const data = [
  [
    {
      label: "Settings",
      icon: Cog,
      url: "/profile",
    },
    {
      label: "UShop Business",
      icon: BriefcaseBusiness,
      url: "*",
    },
  ],
  [
    {
      label: "Seller Login",
      icon: ShoppingBag,
      url: "*",
    },
    {
      label: "Buyer Protection",
      icon: ShieldCheck,
      url: "*",
    },
    {
      label: "Help Center",
      icon: CircleHelp,
      url: "/contact",
    },
    {
      label: "Disputes and Reports",
      icon: MessageCircleQuestion,
      url: "/contact",
    },
  ],
  [
    {
      label: "Report IPR infringement",
      icon: Megaphone,
      url: "/contact",
    },
    {
      label: "Accessibily",
      icon: PersonStanding,
      url: "/profile",
    },
    {
      label: "Penalties Information",
      icon: Scale,
      url: "*",
    },
    {
      label: "Notifications",
      icon: Bell,
      url: "/my-orders",
    },
  ],
]

export function NavPopUp() {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setIsOpen(true)
  }, []);

  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCustomerData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_email', user.email)
          .single();

        if (error) {
          console.error('Error fetching customer data:', error.message);
        } else {
          setCustomer(data);
        }
      } else if (userError) {
        console.error('Error getting user:', userError.message);
      }
      setLoading(false);
    };

    fetchCustomerData();
  }, []);

  if (loading){
    return(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <img
          src="/src/assets/ushop.svg"
          alt="logo"
          className="w-[250px] h-[70px] animate-pulse"
        />
      </div>      
    )
  }

  if (!customer) {
    return <div>No customer data found.</div>;
  }  

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }  

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        {customer.customer_email}
      </div>
      <Avatar className="h-8 w-8 rounded-lg">
        {customer.customer_image ? (
        <AvatarImage
         src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${customer.customer_image}`}
         alt={customer.customer_name}
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
