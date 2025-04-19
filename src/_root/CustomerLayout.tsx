
import { AppSidebar } from "@/components/shared/Customer/app-sidebar"
import { CustomerHeader } from "@/components/shared/CustomerHeader"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { Outlet } from "react-router-dom"

export default function CustomerLayout() {
  return (
    <div className="min-h-screen">
    <SidebarProvider>
      <div className="hidden md:block"><AppSidebar /></div>
      <SidebarInset>
        <CustomerHeader />
      <main>
        <Outlet />
        <Toaster />
      </main>  
      </SidebarInset>
    </SidebarProvider>
    </div>
  )
}
