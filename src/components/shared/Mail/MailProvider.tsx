// src/context/MailContext.tsx
"use client"

import * as React from "react"
import { Contact } from "@/types"
import { MailContext } from "./MailContext"


export const MailProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedMail, setSelectedMail] = React.useState<Contact | null>(null)
  const [activeFilter, setActiveFilter] = React.useState("Inbox")

  return (
    <MailContext.Provider value={{ selectedMail, setSelectedMail, activeFilter, setActiveFilter }}>
      {children}
    </MailContext.Provider>
  )
}
