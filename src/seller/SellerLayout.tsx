import { AppSidebar } from "@/components/shared/Seller/AppSidebar";
import { SellerHeader } from "@/components/shared/SellerHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router-dom";


export default function SellerLayout () {

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SellerHeader />
      <main>
        <Outlet />
        <Toaster />
      </main>
      </SidebarInset>
    </SidebarProvider>
  )
}