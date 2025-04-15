"use client"

import * as React from "react"
import { ArchiveX, File, Inbox, Send, Trash2 } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { NavUser } from "./NavUser"
import { Contact } from "@/types"
import supabase from "@/lib/supabaseClient"
import { MailContext } from "./MailContext"

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
      isActive: true,
    },
    {
      title: "Drafts",
      url: "#",
      icon: File,
      isActive: false,
    },
    {
      title: "Sent",
      url: "#",
      icon: Send,
      isActive: false,
    },
    {
      title: "Junk",
      url: "#",
      icon: ArchiveX,
      isActive: false,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
      isActive: false,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState(data.navMain[0])
  const { setOpen } = useSidebar()
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const { setSelectedMail } = React.useContext(MailContext)

  const handleSelectMail = (mail: Contact) => {
    setOpen(true)
    setSelectedMail(mail) // This now pushes it to Inbox.tsx
  }
  
  React.useEffect(() => {
    const fetchContact = async () => {
      const { data } = await supabase
        .from('contacts')
        .select('*, customers(customer_name, customer_email), subject(subject)')

      setContacts(data || []);
    };

    fetchContact();
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  
    const getRelativeTime = (date: Date): string => {
        const now = new Date()
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000) // in seconds
      
        const mins = Math.floor(diff / 60)
        const hours = Math.floor(mins / 60)
        const days = Math.floor(hours / 24)
      
        if (diff < 60) return "Just now"
        if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`
        if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`
        if (days === 1) return "A day ago"
        return `${days} days ago`
    };
          
    const formatSubmittedAt = (timestamp: string): string => {
        const date = new Date(timestamp)
        return `${formatTime(date)} ${getRelativeTime(date)}`
    }
      

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground">
                  <img
                  src="/src/assets/ushop.svg"
                  alt="logo"
                  width={85}
                  height={20}
                  />
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        setOpen(true)
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeItem?.title}
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Unreads</span>
              <Switch className="shadow-none" />
            </Label>
          </div>
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {contacts.map((contact) => (
                <a
                  href="#"
                  key={contact.id}
                  onClick={() => handleSelectMail(contact)}
                  className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <div className="flex w-full items-center gap-2">
                    <span>{contact.customers?.customer_name}</span>{" "}
                    <span className="ml-auto text-xs">{formatSubmittedAt(contact.submitted_at)}</span>
                  </div>
                  <span className="font-medium">{contact.subject?.subject}</span>
                  <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                    {String(contact.message)}
                  </span>
                </a>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
