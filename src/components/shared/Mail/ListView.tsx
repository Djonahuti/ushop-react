"use client"

import { useState, useEffect, useContext } from "react"
import { apiGet, apiPut } from "@/lib/api"
import { Contact } from "@/types"
import { MailContext } from "./MailContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/**
 * ListView: a full-screen list of inbox messages for mobile.
 * Fetches contacts from Supabase and calls setSelectedMail on tap.
 */
export default function ListView() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const { setSelectedMail, activeFilter } = useContext(MailContext)

  const handleSelectMail = async (mail: Contact) => {
    setSelectedMail(mail);

    // Mark the contact as read
    try {
      await apiPut('/contacts.php', { id: mail.id, is_read: true });
    } catch (err) {
      console.error('Error marking contact as read:', err);
    }
  };

  // Fetch messages
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const contactsData = await apiGet<any[]>('/contacts.php');
        const customers = await apiGet<Array<{ customer_id: number; customer_name: string; customer_email: string; customer_image: string | null }>>('/customers.php');
        const subjects = await apiGet<Array<{ subject_id: number; subject: string }>>('/subject.php');
        
        let filtered = contactsData || [];
      if (activeFilter === "Starred") {
          filtered = filtered.filter(c => c.is_starred === true);
      } else if (activeFilter === "Important") {
          filtered = filtered.filter(c => c.is_read === false);
      }

        const hydrated = filtered.map(contact => ({
          ...contact,
          customers: customers?.find(c => c.customer_id === contact.customer_id),
          subject: subjects?.find(s => s.subject_id === contact.subject_id),
        }));
        
        setContacts(hydrated.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()));
      } catch (err) {
        console.error('Error loading contacts:', err);
      }
    }
    fetchContacts()
  }, [activeFilter])

  // Helpers for time formatting
  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const getRelativeTime = (date: Date): string => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    const mins = Math.floor(diff / 60)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (diff < 60) return 'Just now'
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    if (days === 1) return 'A day ago'
    return `${days} days ago`
  }

  const formatSubmittedAt = (timestamp: string): string => {
    const date = new Date(timestamp)
    return `${formatTime(date)} · ${getRelativeTime(date)}`
  };

  const toggleStar = async (contact: Contact) => {
    const newStarredStatus = !contact.is_starred;
    try {
      await apiPut('/contacts.php', { id: contact.id, is_starred: newStarredStatus });
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contact.id ? { ...c, is_starred: newStarredStatus } : c
      )
    );
    } catch (err) {
      console.error('Error toggling star:', err);
    }
  };  

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          onClick={() => setSelectedMail(contact)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setSelectedMail(contact);
          }}
          className={`w-full text-left flex flex-col gap-2 border-b p-4 hover:bg-accent ${
            contact.is_read ? 'myBox' : 'unread'
          }`}
        >
          <div className="flex items-center gap-2">
            <Avatar>
            {contact.customers?.customer_image ? (
              <AvatarImage
                src={`/${contact.customers?.customer_image}`}
                alt={contact.customers?.customer_name}
                className="w-6 h-6 rounded-full object-cover"
              />                     
            ):(
              <AvatarFallback className="rounded-lg">{contact.customers?.customer_name.substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
            </Avatar>
            <span className="font-medium">{contact.customers?.customer_name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {formatSubmittedAt(contact.submitted_at)}
            </span>
          </div>
          <div className="flex justify-between space-x-8 items-center relative gap-1">
          <span className="text-sm font-semibold">{contact.subject?.subject}</span>
          <a
            href="#"
            key={contact.id}
            onClick={() => handleSelectMail(contact)}
            className="text-lg left-2 text-yellow-500 hover:text-yellow-600"
          >
              <button onClick={() => toggleStar(contact)}>
                {contact.is_starred ? '★' : '☆'} {/* Star icon */}
              </button>
          </a>                      
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {String(contact.message)}
          </p>
        </div>
      ))}
    </div>
  )
}
