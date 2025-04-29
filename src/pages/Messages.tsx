import React, { useState, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Mail, 
  Search, 
  Send, 
  Phone, 
  Paperclip, 
  FileText, 
  FileImage, 
  File, 
  X,
  AlertCircle
} from 'lucide-react';
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { sendEmailNotification } from "@/utils/notifications";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  read: boolean;
  isEmail?: boolean;
  subject?: string;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: "report" | "invoice" | "picture" | "file";
  url: string;
  size: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface EmailFormValues {
  to: string;
  subject: string;
  message: string;
}

const Messages = () => {
  // Sample data
  const [contacts, setContacts] = useLocalStorage<Contact[]>('message-contacts', [
    { id: '1', name: 'John Smith', email: 'john@example.com', phone: '555-123-4567' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '555-987-6543' },
    { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com', phone: '555-456-7890' },
    { id: '4', name: 'Emily Chen', email: 'emily@example.com', phone: '555-234-5678' }
  ]);
  const [messages, setMessages] = useLocalStorage<Message[]>('messages', [
    { 
      id: '1', 
      sender: '1', 
      recipient: 'me', 
      content: 'Hello, I wanted to check on the status of my repair job.',
      timestamp: '2025-04-14T09:30:00',
      read: true
    },
    { 
      id: '2', 
      sender: 'me', 
      recipient: '1', 
      content: 'Hi John, your repair is scheduled for completion tomorrow. I\'ll send you an update once it\'s done.',
      timestamp: '2025-04-14T09:35:00',
      read: true
    },
    { 
      id: '3', 
      sender: '2', 
      recipient: 'me', 
      content: 'Do you have any appointments available next week?',
      timestamp: '2025-04-14T10:15:00',
      read: false
    },
    { 
      id: '4', 
      sender: '3', 
      recipient: 'me', 
      content: 'Thanks for the quick repair! My car is running great now.',
      timestamp: '2025-04-13T14:20:00',
      read: true
    },
    {
      id: '5',
      sender: 'me',
      recipient: '1',
      content: 'Here is the invoice for your recent repair.',
      timestamp: '2025-04-14T11:25:00',
      read: true,
      isEmail: true,
      subject: 'Invoice for Repair #45678',
      attachments: [
        {
          id: 'a1',
          name: 'Invoice_45678.pdf',
          type: 'invoice',
          url: '#',
          size: '156 KB'
        }
      ]
    }
  ]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [messageType, setMessageType] = useState<'chat' | 'email'>('chat');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Forms
  const emailForm = useForm<EmailFormValues>({
    defaultValues: {
      to: "",
      subject: "",
      message: ""
    }
  });

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedContact = contacts.find(contact => contact.id === selectedContactId);

  const conversationMessages = selectedContactId 
    ? messages.filter(message => 
        (message.sender === selectedContactId && message.recipient === 'me') || 
        (message.sender === 'me' && message.recipient === selectedContactId)
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContactId) return;
    const message: Message = {
      id: Date.now().toString(),
      sender: 'me',
      recipient: selectedContactId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true
    };
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleSendEmail = async (values: EmailFormValues) => {
    if (!selectedContactId) return;
    const contact = contacts.find(c => c.id === selectedContactId);
    if (!contact) return;
    try {
      await sendEmailNotification(
        contact.email,
        "EMAIL-" + Date.now().toString(),
        values.subject
      );
      const message: Message = {
        id: Date.now().toString(),
        sender: 'me',
        recipient: selectedContactId,
        content: values.message,
        timestamp: new Date().toISOString(),
        read: true,
        isEmail: true,
        subject: values.subject,
        attachments: attachments.length > 0 ? [...attachments] : undefined
      };
      setMessages([...messages, message]);
      setAttachments([]);
      setShowEmailDialog(false);
      toast({
        title: "Email sent",
        description: `Email sent to ${contact.name}`
      });
      emailForm.reset();
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: "There was an error sending your email. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAttachFile = (type: "report" | "invoice" | "picture" | "file") => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      fileInputRef.current.dataset.type = type;
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const type = fileInputRef.current?.dataset.type as "report" | "invoice" | "picture" | "file" || "file";
    const newAttachments = Array.from(files).map(file => ({
      id: Date.now() + Math.random().toString(36).substring(2, 15),
      name: file.name,
      type: type,
      url: URL.createObjectURL(file),
      size: formatFileSize(file.size)
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const markAsRead = () => {
    if (!selectedContactId) return;
    const updatedMessages = messages.map(message => 
      message.sender === selectedContactId && message.recipient === 'me' && !message.read
        ? { ...message, read: true }
        : message
    );
    setMessages(updatedMessages);
  };

  React.useEffect(() => {
    if (selectedContactId) {
      markAsRead();
      if (selectedContact) {
        emailForm.setValue('to', selectedContact.email);
      }
    }
  }, [selectedContactId]);

  const openEmailComposer = () => {
    if (!selectedContact) return;
    emailForm.setValue('to', selectedContact.email);
    setShowEmailDialog(true);
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'report':
        return <FileText className="h-4 w-4" />;
      case 'invoice':
        return <FileText className="h-4 w-4" />;
      case 'picture':
        return <FileImage className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center p-6 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={openEmailComposer}
        >
          <Mail className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex h-[calc(100vh-13rem)] overflow-hidden rounded-md border">
          {/* Contacts Sidebar */}
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-medium mb-2">Messages</h2>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {filteredContacts.map(contact => {
                const unreadCount = messages.filter(m => 
                  m.sender === contact.id && m.recipient === 'me' && !m.read
                ).length;
                const lastMessage = messages
                  .filter(m => 
                    (m.sender === contact.id && m.recipient === 'me') ||
                    (m.sender === 'me' && m.recipient === contact.id)
                  )
                  .sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  )[0];
                return (
                  <div 
                    key={contact.id}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-100",
                      selectedContactId === contact.id && "bg-slate-100"
                    )}
                    onClick={() => setSelectedContactId(contact.id)}
                  >
                    <Avatar>
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">{contact.name}</h3>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <div className="flex items-center gap-1">
                          {lastMessage.isEmail && <Mail className="h-3 w-3 text-muted-foreground" />}
                          <p className={cn(
                            "text-sm truncate",
                            unreadCount > 0 ? "font-medium" : "text-muted-foreground"
                          )}>
                            {lastMessage.isEmail ? (lastMessage.subject || "No subject") : lastMessage.content}
                          </p>
                        </div>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <div className="min-w-[20px] h-5 rounded-full bg-repairam text-white text-xs flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 flex flex-col">
            {selectedContact ? (
              <>
                {/* Contact Header */}
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                      <AvatarFallback>{getInitials(selectedContact.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-medium">{selectedContact.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={openEmailComposer}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
                  <div className="space-y-4">
                    {conversationMessages.map((message, index, arr) => {
                      const isFirstOfDay = index === 0 || 
                        formatMessageDate(message.timestamp) !== formatMessageDate(arr[index - 1].timestamp);
                      return (
                        <React.Fragment key={message.id}>
                          {isFirstOfDay && (
                            <div className="flex justify-center my-4">
                              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                                {formatMessageDate(message.timestamp)}
                              </span>
                            </div>
                          )}
                          <div className={cn(
                            "flex",
                            message.sender === 'me' ? "justify-end" : "justify-start"
                          )}>
                            <div className={cn(
                              "max-w-[70%] rounded-lg px-4 py-2",
                              message.sender === 'me' 
                                ? "bg-repairam text-white rounded-br-none" 
                                : "bg-gray-100 rounded-bl-none"
                            )}>
                              {message.isEmail && (
                                <div className="mb-2">
                                  <div className="text-sm font-medium mb-1">
                                    {message.subject || "No subject"}
                                  </div>
                                </div>
                              )}
                              <p>{message.content}</p>
                              {/* Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className={cn(
                                  "mt-2 space-y-2 border-t pt-2",
                                  message.sender === 'me' ? "border-white/30" : "border-gray-300"
                                )}>
                                  {message.attachments.map(attachment => (
                                    <div key={attachment.id} className="flex items-center gap-2">
                                      {getAttachmentIcon(attachment.type)}
                                      <span className="text-sm overflow-hidden text-ellipsis">{attachment.name}</span>
                                      <span className="text-xs opacity-70">{attachment.size}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className={cn(
                                "text-xs mt-1",
                                message.sender === 'me' ? "text-white/70" : "text-slate-500"
                              )}>
                                {formatMessageTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
                {/* Message Input */}
                <div className="p-4 border-t">
                  <Tabs value={messageType} onValueChange={(val) => setMessageType(val as 'chat' | 'email')}>
                    <TabsList className="grid w-[200px] grid-cols-2 mb-4">
                      <TabsTrigger value="chat">Chat</TabsTrigger>
                      <TabsTrigger value="email">Email</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chat" className="mt-0">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          className="resize-none"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="email" className="mt-0">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal"
                        onClick={openEmailComposer}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Compose an email to {selectedContact?.name}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col p-4 text-center text-muted-foreground">
                <Mail className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p>Choose a contact to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
            <DialogDescription>
              Send an email to the selected contact
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={emailForm.handleSubmit(handleSendEmail)}>
            <div className="space-y-4 py-4">
              <FormField
                control={emailForm.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emailForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Email subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={emailForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Type your email message..." 
                        className="min-h-[200px]" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Attachment Display */}
              {attachments.length > 0 && (
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          {getAttachmentIcon(attachment.type)}
                          <span className="text-sm">{attachment.name}</span>
                          <span className="text-xs text-muted-foreground">{attachment.size}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Attachment Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAttachFile('report')}
                >
                  <FileText className="h-4 w-4 mr-1" /> Attach Report
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAttachFile('invoice')}
                >
                  <FileText className="h-4 w-4 mr-1" /> Attach Invoice
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAttachFile('picture')}
                >
                  <FileImage className="h-4 w-4 mr-1" /> Attach Picture
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAttachFile('file')}
                >
                  <File className="h-4 w-4 mr-1" /> Attach Other
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelection} 
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
              </div>
              {/* Date Selection */}
              <div>
                <FormLabel>Schedule Send (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Email</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;