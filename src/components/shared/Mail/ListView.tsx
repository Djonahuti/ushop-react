"use client"

import { useState, useEffect, useContext } from "react"
import supabase from "@/lib/supabaseClient"
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
    setSelectedMail(mail); // This now pushes it to Inbox.tsx

    // Mark the contact as read
    await supabase
      .from('contacts')
      .update({ is_read: true })
      .eq('id', mail.id);
  };

  // Fetch messages
  useEffect(() => {
    const fetchContacts = async () => {
      let query = supabase
        .from('contacts')
        .select('*, customers(customer_name, customer_email, customer_image), subject(subject)')
        .order('submitted_at', { ascending: false });

      if (activeFilter === "Starred") {
        query = query.eq('is_starred', true);
      } else if (activeFilter === "Important") {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error loading contacts:', error)
      } else {
        setContacts(data || [])
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
    await supabase
      .from('contacts')
      .update({ is_starred: newStarredStatus })
      .eq('id', contact.id);
    
    // Update local state
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contact.id ? { ...c, is_starred: newStarredStatus } : c
      )
    );
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
                src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${contact.customers?.customer_image}`}
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
