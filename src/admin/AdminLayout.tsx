import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { AppSidebar } from "@/components/shared/Sidebar/LeftSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router-dom";


export default function AdminLayout () {

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <DashboardHeader />
      <main>
        <Outlet />
        <Toaster />
      </main>
      </SidebarInset>
    </SidebarProvider>
  )
}