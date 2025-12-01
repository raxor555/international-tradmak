
import React, { useState, useEffect, useRef } from 'react';
import { Contact, Message, Language, ChatSession, UserData } from '../types';
import { getIconComponent } from '../constants';
import { MoreVertical, Search, Paperclip, Smile, Mic, Send, BookOpenCheck, BadgePercent } from 'lucide-react';
import { sendToWebhook } from '../services/webhookService';
import { UserDetailsForm } from './UserDetailsForm';
import { TypewriterText } from './TypewriterText';

interface ChatWindowProps {
  contact: Contact;
  session: ChatSession;
  onUpdateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  onSendMessage: (contactId: string, text: string) => void;
  onReceiveMessage: (contactId: string, text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  contact, 
  session, 
  onUpdateSession,
  onSendMessage,
  onReceiveMessage
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const Icon = getIconComponent(contact.iconName);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isTyping]);

  // Initial Logic: If no language selected, prompt for it
  useEffect(() => {
    if (session.language === Language.UNSELECTED && session.messages.length === 0) {
      const initialMessage: Message = {
        id: Date.now().toString(),
        text: 'Please select your language / يُرجى اختيار لغتك',
        sender: 'system',
        timestamp: new Date(),
        type: 'language-selector'
      };
      
      onUpdateSession(contact.id, {
        messages: [initialMessage]
      });
    }
  }, [contact.id, session.language, session.messages.length, onUpdateSession]);

  const handleLanguageSelect = (lang: Language) => {
    onUpdateSession(contact.id, {
      language: lang
    });
    
    // Open the form immediately after language selection if we don't have user data yet
    if (!session.userData) {
      setShowUserForm(true);
    }
  };

  const handleFormSubmit = (userData: UserData) => {
    setShowUserForm(false);
    
    const welcomeText = session.language === Language.ENGLISH 
      ? `Welcome, ${userData.name}! We have received your details. How can we help you today?`
      : `مرحبًا ${userData.name}! لقد استلمنا بياناتك. كيف يمكننا مساعدتك اليوم؟`;

    // Add welcome message directly with animation
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: welcomeText,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      isAnimated: true
    };

    onUpdateSession(contact.id, {
      userData: userData,
      messages: [...session.messages, welcomeMessage]
    });
  };

  const handleAnimationComplete = (msgId: string) => {
    // When animation finishes, update the message so it doesn't animate again
    const updatedMessages = session.messages.map(msg => {
      if (msg.id === msgId) {
        return { ...msg, isAnimated: false };
      }
      return msg;
    });
    onUpdateSession(contact.id, { messages: updatedMessages });
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    // Don't allow sending if language not selected or user data missing
    if (session.language === Language.UNSELECTED) {
        alert("Please select a language first / الرجاء اختيار لغة أولاً");
        return;
    }
    
    if (!session.userData) {
      setShowUserForm(true);
      return;
    }

    const text = inputText;
    setInputText('');
    
    // 1. Add User Message to UI
    onSendMessage(contact.id, text);

    // 2. Trigger Webhook
    const webhookUrl = session.language === Language.ENGLISH ? contact.webhooks.en : contact.webhooks.ar;
    
    setIsTyping(true); // Show typing indicator
    
    try {
      const responseText = await sendToWebhook(webhookUrl, {
        message: text,
        language: session.language,
        timestamp: new Date(),
        userData: session.userData,
        sessionId: session.sessionId
      });
      
      setIsTyping(false);
      onReceiveMessage(contact.id, responseText);
    } catch (e) {
      setIsTyping(false);
      // Fallback handled in service, but just in case
      onReceiveMessage(contact.id, "Connection Error.");
    }
  };
  
  const handleInputEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const bgPattern = `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%230b141a' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`;

  const isRestaurant = contact.id === 'restaurant-general';

  return (
    <div className="flex flex-col h-full bg-app-dark relative">
      <UserDetailsForm 
        isOpen={showUserForm} 
        onSubmit={handleFormSubmit} 
        onClose={() => setShowUserForm(false)} 
      />

      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none z-0" 
        style={{ backgroundImage: bgPattern }}
      ></div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-app-sidebar border-b border-gray-700/50 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-app-teal flex items-center justify-center text-white">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-medium text-app-text">{contact.name}</h2>
            <p className="text-xs text-app-subtext">
                {session.language !== Language.UNSELECTED ? (
                   session.language === Language.ARABIC ? 'Arabic' : 'English'
                ) : 'Select a language'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <Search className="w-5 h-5 cursor-pointer hover:text-white" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white" />
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 z-10 space-y-4">
        {session.messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] md:max-w-[60%] rounded-lg px-3 py-2 shadow-sm relative text-sm leading-relaxed
                ${msg.sender === 'user' 
                  ? 'bg-app-outgoing text-white rounded-tr-none' 
                  : 'bg-app-incoming text-app-text rounded-tl-none'}
              `}
            >
              {msg.type === 'language-selector' ? (
                <div className="flex flex-col gap-3">
                  <p className="font-medium text-center pb-2 border-b border-gray-700">{msg.text}</p>
                  <div className="flex gap-2 justify-center mt-1">
                    <button 
                        onClick={() => handleLanguageSelect(Language.ENGLISH)}
                        className="flex-1 px-4 py-2 bg-app-teal hover:bg-app-tealDark text-white rounded text-xs font-bold transition-colors uppercase tracking-wide"
                    >
                        English
                    </button>
                    <button 
                        onClick={() => handleLanguageSelect(Language.ARABIC)}
                        className="flex-1 px-4 py-2 bg-app-teal hover:bg-app-tealDark text-white rounded text-xs font-bold transition-colors font-serif"
                    >
                        العربية
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div dir={session.language === Language.ARABIC && msg.sender !== 'user' ? 'rtl' : 'ltr'}>
                    {msg.sender === 'bot' && msg.isAnimated ? (
                      <TypewriterText 
                        text={msg.text} 
                        onComplete={() => handleAnimationComplete(msg.id)}
                      />
                    ) : (
                      msg.text
                    )}
                  </div>
                  <div className={`text-[10px] mt-1 flex ${msg.sender === 'user' ? 'justify-end text-blue-100' : 'justify-end text-gray-400'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-app-incoming rounded-lg rounded-tl-none px-4 py-3 flex items-center gap-1">
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
             </div>
           </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className="bg-app-sidebar px-4 py-2 z-10 flex items-center gap-3">
        <button className="text-gray-400 hover:text-gray-200">
            <Smile className="w-6 h-6" />
        </button>
        <button className="text-gray-400 hover:text-gray-200">
            <Paperclip className="w-6 h-6" />
        </button>

        {isRestaurant && (
          <>
            <button className="text-gray-400 hover:text-app-teal transition-colors" title="Menu">
                <BookOpenCheck className="w-6 h-6" />
            </button>
            <button className="text-gray-400 hover:text-app-teal transition-colors" title="Offers">
                <BadgePercent className="w-6 h-6" />
            </button>
          </>
        )}
        
        <div className="flex-1 bg-app-input rounded-lg flex items-center px-4 py-2">
            <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleInputEnter}
                placeholder={
                  session.language === Language.UNSELECTED 
                    ? "Select language above..." 
                    : !session.userData 
                      ? "Complete your details..." 
                      : "Type a message"
                }
                disabled={session.language === Language.UNSELECTED || !session.userData || isTyping}
                className="w-full bg-transparent border-none outline-none text-app-text placeholder-gray-500 text-sm"
            />
        </div>

        {inputText.trim() ? (
            <button onClick={handleSend} className="text-app-teal hover:text-app-tealDark transition-colors">
                <Send className="w-6 h-6" />
            </button>
        ) : (
            <button className="text-gray-400 hover:text-gray-200">
                <Mic className="w-6 h-6" />
            </button>
        )}
      </footer>
    </div>
  );
};
