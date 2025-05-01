import { useContext } from "react"
import { MailContext } from "./MailContext"
import Inbox from "./Inbox"
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
      <div className="hidden md:block h-screen">
      <Inbox />
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