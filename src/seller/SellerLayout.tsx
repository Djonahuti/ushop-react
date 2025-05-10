import { AppSidebar } from "@/components/shared/Seller/AppSidebar";
import { SellerHeader } from "@/components/shared/SellerHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router-dom";


export default function SellerLayout () {

  return (
    <div className="min-h-screen">
    <SidebarProvider>
      <div className="hidden md:block"><AppSidebar variant="inset" /></div>
      <SidebarInset>
        <SellerHeader />
      <main>
        <Outlet />
        <Toaster />
      </main>
      </SidebarInset>
    </SidebarProvider>
    </div>
  )
}