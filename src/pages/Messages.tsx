
import React, { useState } from 'react';
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
import { Mail, Search, Send, Phone } from 'lucide-react';
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
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
    }
  ]);
  
  const [selectedContactId, setSelectedContactId] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  const markAsRead = () => {
    if (!selectedContactId) return;
    
    const updatedMessages = messages.map(message => 
      message.sender === selectedContactId && message.recipient === 'me' && !message.read
        ? { ...message, read: true }
        : message
    );
    
    setMessages(updatedMessages);
  };
  
  // Mark messages as read when a contact is selected
  React.useEffect(() => {
    if (selectedContactId) {
      markAsRead();
    }
  }, [selectedContactId]);
  
  return (
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
                    <p className={cn(
                      "text-sm truncate",
                      unreadCount > 0 ? "font-medium" : "text-muted-foreground"
                    )}>
                      {lastMessage.content}
                    </p>
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
                <Button variant="ghost" size="icon">
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
                          <p>{message.content}</p>
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
  );
};

export default Messages;
