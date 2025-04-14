
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "./Sidebar"
import { MailHeader } from "./MailHeader"
import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { MailProvider } from "./MailContext"

export default function MailLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
    <MailProvider>
    <AppSidebar />
      <SidebarInset>
        <MailHeader />
        <main>
            <div className="flex flex-1 flex-col gap-4 p-4">
                <Outlet />
                <Toaster />
            </div>
        </main>
      </SidebarInset>        
    </MailProvider>    

    </SidebarProvider>
  )
}