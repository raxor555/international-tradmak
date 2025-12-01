
import React, { useState } from 'react';
import { CONTACTS } from './constants';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { Contact, ChatSession, Language, Message } from './types';

const App: React.FC = () => {
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});

  const generateSessionId = () => {
    // Simple unique ID generator
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  const handleSelectContact = (contact: Contact) => {
    setActiveContact(contact);
    if (!sessions[contact.id]) {
      setSessions(prev => ({
        ...prev,
        [contact.id]: {
          contactId: contact.id,
          messages: [],
          language: Language.UNSELECTED,
          sessionId: generateSessionId()
        }
      }));
    }
  };

  const updateSession = (contactId: string, updates: Partial<ChatSession>) => {
    setSessions(prev => ({
      ...prev,
      [contactId]: {
        ...prev[contactId],
        ...updates
      }
    }));
  };

  const handleSendMessage = (contactId: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setSessions(prev => {
      const session = prev[contactId];
      return {
        ...prev,
        [contactId]: {
          ...session,
          messages: [...session.messages, newMessage]
        }
      };
    });
  };

  const handleReceiveMessage = (contactId: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      isAnimated: true // Enable typewriter effect for bot messages
    };

    setSessions(prev => {
      const session = prev[contactId];
      // Check if session exists (should always exist if receiving message)
      if (!session) return prev;
      
      return {
        ...prev,
        [contactId]: {
          ...session,
          messages: [...session.messages, newMessage]
        }
      };
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-app-dark text-app-text font-sans antialiased">
      {/* Sidebar - Hidden on mobile if chat is active, or use simple visibility logic */}
      <div className={`${activeContact ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full`}>
        <ChatSidebar 
          contacts={CONTACTS} 
          activeContactId={activeContact?.id || null} 
          onSelectContact={handleSelectContact} 
        />
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 h-full ${!activeContact ? 'hidden md:flex' : 'flex'} flex-col bg-app-dark relative`}>
        {activeContact ? (
          <ChatWindow 
            contact={activeContact} 
            session={sessions[activeContact.id]} 
            onUpdateSession={updateSession}
            onSendMessage={handleSendMessage}
            onReceiveMessage={handleReceiveMessage}
          />
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-app-sidebar border-l border-gray-800">
            <div className="w-64 h-64 mb-8 opacity-50 grayscale">
                 <img src="https://picsum.photos/400/400?grayscale" alt="Welcome" className="rounded-full shadow-2xl" />
            </div>
            <h1 className="text-3xl font-light text-gray-300 mb-4">TradMAK Connect</h1>
            <p className="text-gray-500 max-w-md">
              Select a retailer or warehouse from the sidebar to start communicating. 
              Secure, end-to-end webhook integration for instant order processing.
            </p>
            <div className="mt-8 flex gap-2 text-xs text-gray-600">
                <span>🔒 End-to-end encrypted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
