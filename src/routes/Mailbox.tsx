import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    Mail,
    ChevronLeft,
    Plus,
    Trash2,
    RefreshCw,
    Send,
    File,
    X,
    Check,
    AlertTriangle,
    Settings,
    LogOut,
    Inbox,
    Star,
    Clock,
    Paperclip,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import supabase from '@/lib/supabaseClient';

// Define the Contact type to match your database schema
export type Contact = {
    id: number;
    customer_id: number;
    subject_id: number;
    message: string; // Changed from Text to string
    submitted_at: string;
    customers?: {
        customer_name: string;
        customer_email: string;
        customer_image: string;
    };
    subject?: {
        subject: string;
    };
};

// Mock Email type, adjusted to better fit the application's needs, and to avoid conflicts.
interface Email {
    id: string;
    sender: string;
    subject: string;
    body: string;
    isRead: boolean;
    isStarred: boolean;
    sentAt: Date;
    attachments?: { name: string, url: string }[];
}

// Animation Variants
const emailVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.1 } }
};

const sidebarVariants = {
    open: { width: 250, transition: { duration: 0.3, ease: "easeInOut" } },
    closed: { width: 72, transition: { duration: 0.3, ease: "easeInOut" } }
};

// Helper Components
const EmailListItem = ({
    email,
    onSelect,
    isActive,
    onStar,
    isExpanded
}: {
    email: Email;
    onSelect: (email: Email) => void;
    isActive: boolean;
    onStar: (id: string) => void;
    isExpanded: boolean;
}) => {
    const senderName = email.sender.split('@')[0];
    const timeAgo = formatDistanceToNow(email.sentAt, { addSuffix: true });

    return (
        <motion.div
            variants={emailVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors duration-200",
                "cursor-pointer",
                isActive ? "bg-blue-100 dark:bg-blue-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-900/50",
                "border-b border-gray-200 dark:border-gray-800"
            )}
            onClick={() => onSelect(email)}
        >
            <Avatar className="h-9 w-9">
                <AvatarFallback>{senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className={cn(
                        "text-sm font-medium truncate",
                        isExpanded ? "max-w-[160px] dark:text-white" : "max-w-[100px] dark:text-gray-200"
                    )}>
                        {senderName}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
                </div>
                <div className="flex items-center justify-between w-full">
                    <p className={cn(
                        "text-sm truncate",
                        email.isRead ? "text-gray-500 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-white"
                    )}>
                        {email.subject}
                    </p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent email selection
                    onStar(email.id);
                }}
                className={cn(
                    "h-8 w-8",
                    email.isStarred ? "text-yellow-500" : "text-gray-400 hover:text-yellow-400"
                )}
                title={email.isStarred ? "Remove from Starred" : "Add to Starred"}
            >
                <Star className="h-5 w-5" />
            </Button>
        </motion.div>
    );
};

const EmailView = ({
    email,
    onDelete,
    onMarkAsRead,
    onMarkAsUnread,
    onReply
}: {
    email: Email;
    onDelete: (id: string) => void;
    onMarkAsRead: (id: string) => void;
    onMarkAsUnread: (id: string) => void;
    onReply: (to: string, subject: string) => void;
}) => {
    const [showFullBody, setShowFullBody] = useState(false);
    const senderName = email.sender.split('@')[0];

    // Function to handle attachment download (mock implementation)
    const handleDownload = (attachment: { name: string, url: string }) => {
        console.log(`Downloading attachment: ${attachment.name} from ${attachment.url}`);
        // In a real app, you would use a library or API to handle the download
        // Example: window.open(attachment.url, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 p-4 space-y-4 bg-white dark:bg-gray-950 rounded-lg shadow-md"
        >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{email.subject}</h2>
                <div className="flex gap-2">
                    {!email.isRead && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMarkAsRead(email.id)}
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Mark as Read
                        </Button>
                    )}
                    {email.isRead && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMarkAsUnread(email.id)}
                            className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 hover:text-yellow-300"
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Mark as Unread
                        </Button>
                    )}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="dark:bg-gray-900 dark:text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-white">Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-gray-300">
                                    This email will be permanently deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(email.id)}
                                    className="bg-red-500 text-white hover:bg-red-600"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarFallback>{senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{senderName} ({email.sender})</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sent: {email.sentAt.toLocaleDateString()} {email.sentAt.toLocaleTimeString()}
                    </p>
                </div>
            </div>
            {email.attachments && email.attachments.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Paperclip className="w-4 h-4" />
                        Attachments ({email.attachments.length})
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {email.attachments.map((attachment, index) => (
                            <div
                                key={index}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs"
                            >
                                <File className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{attachment.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDownload(attachment)}
                                    className="h-6 w-6 text-blue-500 hover:text-blue-600"
                                    title={`Download ${attachment.name}`}
                                >
                                    {/* Use a download icon if available in Lucide */}
                                    <Download />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <p className={cn(
                "text-sm",
                showFullBody ? "whitespace-pre-line dark:text-gray-200" : "line-clamp-3 dark:text-gray-300"
            )}>
                {email.body}
            </p>
            {!showFullBody && (
                <Button
                    variant="link"
                    className="p-0 mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => setShowFullBody(true)}
                >
                    Read More
                </Button>
            )}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <Button
                    variant="outline"
                    onClick={() => onReply(email.sender, email.subject)}
                    className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300"
                >
                    <ReplyIcon className="h-4 w-4 mr-2" />
                    Reply
                </Button>
            </div>
        </motion.div>
    );
};

// Custom Reply Icon (since Lucide doesn't have a direct one, often same as rotate-ccw)
const ReplyIcon = ({ ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M10 15v4a3 3 0 0 0 3 3h7" />
        <path d="M3 9h17" />
        <path d="M18 4l-6 5 6 5" />
    </svg>
);

const ComposeEmail = ({
    onSend,
    contacts,
    onClose
}: {
    onSend: (email: Omit<Email, 'id' | 'isRead' | 'sentAt'>) => void;
    contacts: Contact[];
    onClose: () => void;
}) => {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleSend = async () => {
        if (!to.trim() || !subject.trim() || !body.trim()) {
            setSendError("Please fill in all fields.");
            return;
        }
        if (!isValidEmail(to)) {
            setSendError("Invalid email address.");
            return;
        }

        setIsSending(true);
        setSendError(null);

        // Simulate sending delay and potential errors
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            // Simulate a 20% chance of failure
            if (Math.random() < 0.2) {
                throw new Error("Failed to send email. Please try again.");
            }

            const newEmail: Omit<Email, 'id' | 'isRead' | 'sentAt'> = {
                sender: 'you@example.com', // Replace with actual user's email.  This would come from your auth system
                subject,
                body,
                isStarred: false, // Add the required isStarred property
            };
            onSend(newEmail);
            setShowConfirmation(true); // Show confirmation
            // Reset form after successful send (and after user sees confirmation)
            setTimeout(() => {
                setTo('');
                setSubject('');
                setBody('');
                setShowConfirmation(false);
                onClose(); // Close the compose modal
            }, 1500);

        } catch (error: unknown) {
            if (error instanceof Error) {
                setSendError(error.message || "An unexpected error occurred.");
            } else {
                setSendError("An unexpected error occurred.");
            }
        } finally {
            setIsSending(false);
        }
    };

    // Basic email validation
    const isValidEmail = (email: string) => {
        const re = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        return re.test(email);
    };

    const handleClose = () => {
        if (to.trim() || subject.trim() || body.trim()) {
            // Show a confirmation if there's unsaved content
            setShowConfirmation(true); // Reuse the confirmation for discard
        } else {
            onClose(); // Close without confirmation if empty
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Compose Email</h2>
                <Button variant="ghost" onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <Input
                type="email"
                placeholder="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="dark:bg-gray-800 dark:text-white"
                list="contactList" // Connect to the datalist
            />
            {/* Datalist for contacts */}
            <datalist id="contactList">
                {contacts.map((contact) => (
                    <option key={contact.id} value={contact.customers?.customer_email || ''}>
                        {contact.customers?.customer_name}
                    </option>
                ))}
            </datalist>

            <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="dark:bg-gray-800 dark:text-white"
            />
            <Textarea
                placeholder="Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="dark:bg-gray-800 dark:text-white min-h-[160px]"
            />
            {sendError && (
                <p className="text-red-500 text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    {sendError}
                </p>
            )}
            <div className="flex justify-end gap-2">
                <Button
                    onClick={handleClose} // Use our custom close handler
                    disabled={isSending}
                    className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSend}
                    disabled={isSending}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                >
                    {isSending ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4 mr-2" />
                            Send
                        </>
                    )}
                </Button>
            </div>

            {/* Confirmation/Discard Modal */}
            <AnimatePresence>
                {showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg space-y-4"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {to.trim() || subject.trim() || body.trim()
                                    ? "Discard Email?"
                                    : "Email Sent!"
                                }
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                {to.trim() || subject.trim() || body.trim()
                                    ? "Are you sure you want to discard this email? Your changes will be lost."
                                    : "Your email has been sent successfully."
                                }
                            </p>
                            <div className="flex justify-end gap-2">
                                {to.trim() || subject.trim() || body.trim() ? (
                                    <>
                                        <Button
                                            onClick={onClose}
                                            className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600"
                                        >
                                            Discard
                                        </Button>
                                        <Button
                                            onClick={() => setShowConfirmation(false)} // Just close confirmation
                                            className="bg-blue-500 text-white hover:bg-blue-600"
                                        >
                                            Continue Editing
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={onClose} // Close after successful send
                                        className="bg-blue-500 text-white hover:bg-blue-600"
                                    >
                                        OK
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Main App Component
const Mailbox = () => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [view, setView] = useState<'inbox' | 'starred' | 'scheduled'>('inbox');
    const [searchTerm, setSearchTerm] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    // Fetch contacts from Supabase
    useEffect(() => {
        const fetchContacts = async () => {
            const { data, error } = await supabase
                .from('contacts')
                .select('*, customers(customer_name, customer_email, customer_image), subject(subject)');

            if (error) {
                console.error('Error fetching contacts:', error);
            } else {
                setContacts(data);
            }
        };

        fetchContacts();
    }, []);

    // Fetch emails from Supabase, and transform them to the Email type
    useEffect(() => {
        const fetchEmails = async () => {
            const { data, error } = await supabase
                .from('contacts')
                .select('*, customers(customer_name, customer_email, customer_image), subject(subject)');
            if (error) {
                console.error('Error fetching emails:', error);
            } else {
                // Transform the data to the Email type
                interface ContactWithRelations extends Contact {
                    customers?: {
                        customer_name: string;
                        customer_email: string;
                        customer_image: string;
                    };
                    subject?: {
                        subject: string;
                    };
                }

                const transformedEmails: Email[] = (data as ContactWithRelations[]).map((contact: ContactWithRelations): Email => {
                    //Basic heuristic to determine sender.
                    const sender: string = contact.customers?.customer_email || "unknown@example.com";
                    return {
                        id: String(contact.id), // Use contact.id as a unique string ID
                        sender: sender,
                        subject: contact.subject?.subject || 'No Subject', // Provide a default
                        body: contact.message || '', // Provide a default
                        isRead: false, // Set a default value.  You'd likely want a "read" status in your DB.
                        isStarred: false, // Set a default, or get this from your DB if you add it
                        sentAt: new Date(contact.submitted_at), // Convert string to Date
                        attachments: [], // Mocked.  You'd need a separate table for attachments in a real app.
                    };
                });
                setEmails(transformedEmails);
            }
        };

        fetchEmails();
    }, []);

    const handleEmailSelect = (email: Email) => {
        setSelectedEmail(email);
        if (!email.isRead) {
            handleMarkAsRead(email.id);
        }
    };

    const handleGoBack = () => {
        setSelectedEmail(null);
    };

    const handleDeleteEmail = (id: string) => {
        setEmails(prevEmails => prevEmails.filter(email => email.id !== id));
        setSelectedEmail(null);
    };

    const handleMarkAsRead = (id: string) => {
        setEmails(prevEmails =>
            prevEmails.map(email =>
                email.id === id ? { ...email, isRead: true } : email
            )
        );
    };

    const handleMarkAsUnread = (id: string) => {
        setEmails(prevEmails =>
            prevEmails.map(email =>
                email.id === id ? { ...email, isRead: false } : email
            )
        );
    };

    const handleStarEmail = (id: string) => {
        setEmails(prevEmails =>
            prevEmails.map(email =>
                email.id === id ? { ...email, isStarred: !email.isStarred } : email
            )
        );
    };

    const handleSendEmail = (newEmail: Omit<Email, 'id' | 'isRead' | 'sentAt'>) => {
        // In a real application, you would send the email to your backend (or use a service like SendGrid)
        //  and then, upon successful sending, add it to the list.  For this mock, we'll just add it.

        const emailToSend: Email = {
            id: `id-${Date.now()}`, // This would be generated by your database.
            ...newEmail,
            sender: 'you@example.com', // Replace with the actual sender.
            isRead: true, // Mark as read by default.
            sentAt: new Date(),
        };

        setEmails(prevEmails => [emailToSend, ...prevEmails]);
        setIsComposeOpen(false);
    };

    const filteredEmails = emails.filter(email => {
        const searchLower = searchTerm.toLowerCase();
        const senderName = email.sender.split('@')[0].toLowerCase();
        const subjectLower = email.subject.toLowerCase();
        const bodyLower = email.body.toLowerCase();

        const matchesSearch =
            senderName.includes(searchLower) ||
            subjectLower.includes(searchLower) ||
            bodyLower.includes(searchLower);

        const matchesView =
            (view === 'inbox') ||
            (view === 'starred' && email.isStarred) ||
            (view === 'scheduled' && email.sentAt > new Date()); // Mock scheduled

        return matchesSearch && matchesView;
    });

    // Sort emails: unread first, then by date (newest first)
    const sortedEmails = [...filteredEmails].sort((a, b) => {
        if (a.isRead === b.isRead) {
            return b.sentAt.getTime() - a.sentAt.getTime(); // Newest first
        }
        return a.isRead ? 1 : -1; // Unread first
    });

    const handleReply = (to: string, subject: string) => {
        // Pre-populate the compose modal with recipient and subject
        setIsComposeOpen(true);
        // In a real app, you might want a better subject, like "Re: Original Subject"
        const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
        // You'd also handle adding the 'to' field correctly, might be a comma-separated list
        //  and you might want to show the sender's name as well.
        setTo(to);
        setSubject(replySubject);
        setBody(`\n\n---Original Message---\nFrom: ${to}\nSubject: ${subject}\n\n`); // Add original message
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <motion.div
                variants={sidebarVariants}
                initial="open"
                animate={isSidebarOpen ? "open" : "closed"}
                className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isSidebarOpen ? "Mailspring Lite" : "Mail"}
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        {isSidebarOpen ? (
                            <ChevronLeft className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
                <div className="p-2 space-y-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                        onClick={() => setIsComposeOpen(true)}
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        {isSidebarOpen ? "Compose" : ""}
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start",
                            view === 'inbox' ? "bg-blue-100 dark:bg-blue-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-900/50",
                            "text-gray-700 dark:text-gray-300"
                        )}
                        onClick={() => {
                            setView('inbox');
                            setSelectedEmail(null);
                        }}
                    >
                        <Inbox className="h-5 w-5 mr-2" />
                        {isSidebarOpen ? "Inbox" : ""}
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start",
                            view === 'starred' ? "bg-blue-100 dark:bg-blue-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-900/50",
                            "text-gray-700 dark:text-gray-300"
                        )}
                        onClick={() => {
                            setView('starred');
                            setSelectedEmail(null);
                        }}
                    >
                        <Star className="h-5 w-5 mr-2" />
                        {isSidebarOpen ? "Starred" : ""}
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start",
                            view === 'scheduled' ? "bg-blue-100 dark:bg-blue-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-900/50",
                            "text-gray-700 dark:text-gray-300"
                        )}
                        onClick={() => {
                            setView('scheduled');
                            setSelectedEmail(null);
                        }}
                    >
                        <Clock className="h-5 w-5 mr-2" />
                        {isSidebarOpen ? "Scheduled" : ""}
                    </Button>
                </div>
                {/* Settings (Mock) */}
                <div className="mt-auto p-2 space-y-2 border-t border-gray-200 dark:border-gray-800">
                    <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-900/50 text-gray-700 dark:text-gray-300"
                    >
                        <Settings className="h-5 w-5 mr-2" />
                        {isSidebarOpen ? "Settings" : ""}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-900/50 text-gray-700 dark:text-gray-300"
                    >
                        <LogOut className="h-5 w-5 mr-2" />
                        {isSidebarOpen ? "Logout" : ""}
                    </Button>
                </div>

            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
                    {selectedEmail ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleGoBack}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    )}
                    <Input
                        type="text"
                        placeholder="Search emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 dark:bg-gray-800 dark:text-white"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            // Mock refresh
                            setEmails(prev => [...prev].sort(() => Math.random() - 0.5));
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <RefreshCw className="h-6 w-6" />
                    </Button>
                </div>

                {/* Email List / View */}
                <div className="flex flex-1 overflow-auto">
                    {selectedEmail ? (
                        <EmailView
                            email={selectedEmail}
                            onDelete={handleDeleteEmail}
                            onMarkAsRead={handleMarkAsRead}
                            onMarkAsUnread={handleMarkAsUnread}
                            onReply={handleReply}
                        />
                    ) : (
                        <div className="flex-1">
                            <AnimatePresence>
                                {sortedEmails.map((email: Email) => (
                                    <EmailListItem
                                        key={email.id}
                                        email={email}
                                        onSelect={handleEmailSelect}
                                        isActive={selectedEmail !== null && selectedEmail.id === email.id}
                                        onStar={handleStarEmail}
                                        isExpanded={isSidebarOpen}
                                    />
                                ))}
                            </AnimatePresence>
                            {sortedEmails.length === 0 && (
                                <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
                                    No emails found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Compose Email Modal */}
            <Sheet open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md bg-white dark:bg-gray-900"
                >
                    <ComposeEmail
                        onSend={handleSendEmail}
                        contacts={contacts}
                        onClose={() => setIsComposeOpen(false)} // Simplified close
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Mailbox;
