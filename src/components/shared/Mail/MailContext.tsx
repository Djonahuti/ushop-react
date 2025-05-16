// src/context/MailContext.tsx
"use client"

import * as React from "react"
import { Contact } from "@/types"

type MailContextType = {
  selectedMail: Contact | null
  setSelectedMail: (mail: Contact | null) => void
  activeFilter: string
  setActiveFilter: (filter: string) => void
}

export const MailContext = React.createContext<MailContextType>({
  selectedMail: null,
  setSelectedMail: () => {},
  activeFilter: "Inbox",
  setActiveFilter: () => {},
})

export const MailProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedMail, setSelectedMail] = React.useState<Contact | null>(null)
  const [activeFilter, setActiveFilter] = React.useState("Inbox")

  return (
    <MailContext.Provider value={{ selectedMail, setSelectedMail, activeFilter, setActiveFilter }}>
      {children}
    </MailContext.Provider>
  )
}
