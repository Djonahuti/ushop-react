// src/context/MailContext.tsx
"use client"

import * as React from "react"
import { Contact } from "@/types"

type MailContextType = {
  selectedMail: Contact | null
  setSelectedMail: (mail: Contact | null) => void
}

export const MailContext = React.createContext<MailContextType>({
  selectedMail: null,
  setSelectedMail: () => {},
})

export const MailProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedMail, setSelectedMail] = React.useState<Contact | null>(null)

  return (
    <MailContext.Provider value={{ selectedMail, setSelectedMail }}>
      {children}
    </MailContext.Provider>
  )
}
