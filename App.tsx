
import React, { useState } from 'react';
import { CONTACTS } from './constants';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { Contact, ChatSession, Language, Message } from './types';

const App: React.FC = () => {
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});

  const generateSessionId = () => {
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
    const isImageUrl = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))(\?.*)?$/i.test(text.trim());

    const newMessage: Message = {
      id: Date.now().toString(),
      text: isImageUrl ? 'Photo' : text,
      sender: 'bot',
      timestamp: new Date(),
      type: isImageUrl ? 'image' : 'text',
      mediaUrl: isImageUrl ? text.trim() : undefined,
      isAnimated: !isImageUrl
    };

    setSessions(prev => {
      const session = prev[contactId];
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
    <div className="app-wrapper flex flex-col items-center justify-center bg-app-bg text-app-text font-sans antialiased">
        {/* Green accent background strip could go here, but relying on body color for now */}
        
        <div className="w-full h-full md:max-w-[1600px] md:h-[95vh] md:my-auto bg-app-sidebar md:shadow-panel flex overflow-hidden md:rounded-lg">
            {/* Sidebar */}
            <div className={`${activeContact ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] lg:w-[450px] flex-col border-r border-app-border`}>
                <ChatSidebar 
                    contacts={CONTACTS} 
                    activeContactId={activeContact?.id || null} 
                    onSelectContact={handleSelectContact} 
                />
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 h-full ${!activeContact ? 'hidden md:flex' : 'flex'} flex-col bg-app-chat relative`}>
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
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-app-header border-b-[6px] border-app-teal">
                    <div className="w-64 h-64 mb-8 opacity-90">
                        <img src="https://img.freepik.com/free-vector/messaging-fun-concept-illustration_114360-1574.jpg?t=st=1709999999~exp=1710003599~hmac=xyz" alt="Welcome" className="rounded-full shadow-lg mix-blend-multiply" />
                    </div>
                    <h1 className="text-3xl font-light text-gray-700 mb-4">TradMAK Connect</h1>
                    <p className="text-gray-500 max-w-md">
                    Select a retailer or warehouse from the sidebar to start communicating. 
                    <br/>Secure webhook integration for instant order processing.
                    </p>
                    <div className="mt-8 flex gap-2 text-xs text-gray-400">
                        <span>🔒 End-to-end encrypted</span>
                    </div>
                </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default App;
