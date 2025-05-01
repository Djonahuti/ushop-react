"use client"

import { useContext } from "react"
import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"

import { MailContext } from "./MailContext"
import { SidebarInset } from "@/components/ui/sidebar"
import Inbox from "./Inbox"
import { AppSidebar } from "./Sidebar"
import { MailHeader } from "./MailHeader"
import ListView from "./ListView"

function DetailViewWithBack({ onBack }: { onBack(): void }) {
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <button onClick={onBack} className="text-sm font-medium">
          ← Back to all messages
        </button>
      </header>
      <div className="flex-1 overflow-auto">
        <Inbox />
      </div>
    </div>
  )
}

export default function MailView() {
  const { selectedMail, setSelectedMail } = useContext(MailContext)

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:flex h-screen">
        <AppSidebar className="w-80" />
        <div className="flex-1 flex flex-col">
          <SidebarInset>
            <MailHeader />
            <main className="flex-1 overflow-auto p-4">
              <Outlet />    {/* Renders <Inbox /> via your route */}
              <Toaster />
            </main>
          </SidebarInset>
        </div>
      </div>

      {/* MOBILE */}
      <div className="flex flex-col md:hidden h-screen">
        {selectedMail ? (
          <DetailViewWithBack onBack={() => setSelectedMail(null)} />
        ) : (
          <ListView />
        )}
      </div>
    </>
  )
}
