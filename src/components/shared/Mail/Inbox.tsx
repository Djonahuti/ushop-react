"use client"
import * as React from "react"
import { MailContext } from "./MailContext"

export default function Inbox() {
  const { selectedMail } = React.useContext(MailContext)

  if (!selectedMail) {
    return (
      <div className="flex-1 p-6 text-muted-foreground">
        Select a message to view
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 space-y-4">
      <h2 className="text-xl font-semibold">{selectedMail.subject?.subject}</h2>
      <div className="text-sm text-muted-foreground">
        From: {selectedMail.customers?.customer_name} ({selectedMail.customers?.customer_email})
      </div>
      <hr className="my-2" />
      <p className="whitespace-pre-line">{String(selectedMail.message)}</p>
    </div>
  )
}
