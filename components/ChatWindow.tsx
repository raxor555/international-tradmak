
import React, { useState, useEffect, useRef } from 'react';
import { Contact, Message, Language, ChatSession, UserData, ChatOption } from '../types';
import { getIconComponent, RESTAURANT_WEBHOOKS } from '../constants';
import { MoreVertical, Search, Paperclip, Smile, Mic, Send, BookOpenCheck, BadgePercent, Car, ShoppingBag, Award, X, Utensils } from 'lucide-react';
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

const MENU_IMAGE_URL = "https://res.cloudinary.com/dsscxxw0b/image/upload/v1764875362/Gemini_Generated_Image_4zy1zw4zy1zw4zy1_rlg0ou.png";
const OFFERS_IMAGE_URL = "https://res.cloudinary.com/dsscxxw0b/image/upload/v1764875361/Gemini_Generated_Image_u65zqtu65zqtu65z_q06g1n.png";

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
  const [activePopupImage, setActivePopupImage] = useState<string | null>(null);
  
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
    // 1. Remove the language selector buttons from history
    const filteredMessages = session.messages.filter(msg => msg.type !== 'language-selector');

    // 2. Add a persistent user message confirming the selection
    const confirmText = lang === Language.ENGLISH ? "Language selected: English" : "تم اختيار اللغة: العربية";
    const userMsg: Message = {
        id: Date.now().toString(),
        text: confirmText,
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
    };

    onUpdateSession(contact.id, {
      language: lang,
      messages: [...filteredMessages, userMsg]
    });
    
    // Open the form immediately after language selection if we don't have user data yet
    if (!session.userData) {
      setShowUserForm(true);
    }
  };

  const handleFormSubmit = (userData: UserData) => {
    setShowUserForm(false);
    
    // Save user data
    const updates: Partial<ChatSession> = { userData: userData };

    // Check if it's the restaurant contact
    if (contact.id === 'restaurant-general') {
      const isEnglish = session.language === Language.ENGLISH;
      const optionsMessage: Message = {
        id: Date.now().toString(),
        text: isEnglish ? 'How can we serve you today?' : 'كيف يمكننا خدمتك اليوم؟',
        sender: 'system',
        timestamp: new Date(),
        type: 'option-selector',
        options: [
          { 
            label: isEnglish ? 'Drive Thru' : 'طلبات السيارات', 
            value: 'driveThru', 
            icon: 'Car' 
          },
          { 
            label: isEnglish ? 'Dine In' : 'تجهيز طاولة', 
            value: 'dineIn', 
            icon: 'Utensils' 
          }
        ]
      };
      updates.messages = [...session.messages, optionsMessage];
    } else {
      // Standard flow
      const welcomeText = session.language === Language.ENGLISH 
        ? `Welcome, ${userData.name}! We have received your details. How can we help you today?`
        : `مرحبًا ${userData.name}! لقد استلمنا بياناتك. كيف يمكننا مساعدتك اليوم؟`;

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: welcomeText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        isAnimated: true
      };
      updates.messages = [...session.messages, welcomeMessage];
    }

    onUpdateSession(contact.id, updates);
  };

  const handleRestaurantOptionSelect = async (option: ChatOption) => {
    // 1. Determine specific webhook
    const langKey = session.language === Language.ENGLISH ? 'en' : 'ar';
    // @ts-ignore - Indexing RESTAURANT_WEBHOOKS dynamically
    const specificWebhook = RESTAURANT_WEBHOOKS[langKey][option.value];

    if (!specificWebhook) {
      console.error("Webhook not found for option:", option.value);
      return;
    }

    // 2. Prepare UI updates: 
    //    a) Remove the option selector buttons from history
    //    b) Add a user message indicating selection
    
    const filteredMessages = session.messages.filter(msg => msg.type !== 'option-selector');
    
    const selectionText = session.language === Language.ENGLISH 
      ? `Selected: ${option.label}` 
      : `تم اختيار: ${option.label}`;

    const userMsg: Message = {
        id: Date.now().toString(),
        text: selectionText,
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
    };

    // 3. Update Session: Set specific webhook, persist selected option, and update messages
    onUpdateSession(contact.id, { 
        activeWebhookUrl: specificWebhook,
        selectedOption: option.value,
        messages: [...filteredMessages, userMsg]
    });

    // 4. Trigger Webhook with initial context
    setIsTyping(true);
    try {
      const responseText = await sendToWebhook(specificWebhook, {
        message: `User selected: ${option.value}`, // Initial trigger message for the bot
        selectedOption: option.value, // Sends 'driveThru', 'pickup', or 'loyalty'
        language: session.language,
        timestamp: new Date(),
        userData: session.userData,
        sessionId: session.sessionId
      });
      
      setIsTyping(false);
      onReceiveMessage(contact.id, responseText);
    } catch (e) {
      setIsTyping(false);
      onReceiveMessage(contact.id, "Connection Error.");
    }
  };

  const handleAnimationComplete = (msgId: string) => {
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
    
    onSendMessage(contact.id, text);

    // Determine Webhook URL: Use active/specific if set, else fallback to contact default
    let webhookUrl = session.activeWebhookUrl;
    if (!webhookUrl) {
       webhookUrl = session.language === Language.ENGLISH ? contact.webhooks.en : contact.webhooks.ar;
    }
    
    setIsTyping(true);
    
    try {
      const responseText = await sendToWebhook(webhookUrl, {
        message: text,
        selectedOption: session.selectedOption, // Persist the selected option in subsequent messages
        language: session.language,
        timestamp: new Date(),
        userData: session.userData,
        sessionId: session.sessionId
      });
      
      setIsTyping(false);
      onReceiveMessage(contact.id, responseText);
    } catch (e) {
      setIsTyping(false);
      onReceiveMessage(contact.id, "Connection Error.");
    }
  };
  
  const handleInputEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const bgPattern = `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%230b141a' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`;

  const isRestaurant = contact.id === 'restaurant-general';

  const getOptionIcon = (iconName?: string) => {
    switch(iconName) {
      case 'Car': return Car;
      case 'ShoppingBag': return ShoppingBag;
      case 'Award': return Award;
      case 'Utensils': return Utensils;
      default: return Smile;
    }
  };

  return (
    <div className="flex flex-col h-full bg-app-dark relative">
      <UserDetailsForm 
        isOpen={showUserForm} 
        onSubmit={handleFormSubmit} 
        onClose={() => setShowUserForm(false)} 
      />

      {/* Image Popup Modal */}
      {activePopupImage && (
        <div 
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-200"
          onClick={() => setActivePopupImage(null)}
        >
          <div 
            className="relative max-w-full max-h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActivePopupImage(null)} 
              className="absolute -top-12 right-0 md:-right-12 p-2 bg-gray-800/60 hover:bg-app-teal rounded-full text-white transition-colors border border-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={activePopupImage} 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-gray-800" 
              alt="Popup Content" 
            />
          </div>
        </div>
      )}

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
              className={`max-w-[85%] md:max-w-[70%] rounded-lg shadow-sm relative text-sm leading-relaxed
                ${msg.type === 'option-selector' 
                    ? 'w-full bg-transparent shadow-none p-0' 
                    : msg.sender === 'user' 
                        ? 'bg-app-outgoing text-white rounded-tr-none px-3 py-2' 
                        : 'bg-app-incoming text-app-text rounded-tl-none px-3 py-2'}
              `}
            >
              {msg.type === 'language-selector' && (
                <div className="flex flex-col gap-3 bg-app-incoming p-3 rounded-lg rounded-tl-none">
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
              )}

              {msg.type === 'option-selector' && msg.options && (
                <div className="flex flex-col items-center gap-3 w-full">
                    <div className="bg-app-incoming px-4 py-3 rounded-lg text-center mb-1 text-app-text">
                        {msg.text}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md mx-auto">
                        {msg.options.map((opt) => {
                            const OptIcon = getOptionIcon(opt.icon);
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleRestaurantOptionSelect(opt)}
                                    className="flex flex-col items-center justify-center gap-2 bg-app-sidebar hover:bg-app-active border border-gray-700 hover:border-app-teal p-4 rounded-xl transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-app-teal flex items-center justify-center text-app-teal group-hover:text-white transition-colors">
                                        <OptIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-gray-300 group-hover:text-white">{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
              )}
              
              {msg.type === 'image' && msg.mediaUrl && (
                 <div className="flex flex-col">
                    <div className="relative overflow-hidden rounded-lg mb-1">
                        <img 
                            src={msg.mediaUrl} 
                            alt="Content" 
                            className="block max-w-full h-auto max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition-all"
                            onClick={() => setActivePopupImage(msg.mediaUrl!)}
                            onLoad={scrollToBottom}
                        />
                    </div>
                 </div>
              )}

              {msg.type === 'text' && (
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
              
              {/* Timestamp for image types */}
              {msg.type === 'image' && (
                  <div className={`text-[10px] mt-1 flex ${msg.sender === 'user' ? 'justify-end text-blue-100' : 'justify-end text-gray-400'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
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
            <button 
                onClick={() => setActivePopupImage(MENU_IMAGE_URL)}
                className="text-gray-400 hover:text-app-teal transition-colors" 
                title="Menu"
            >
                <BookOpenCheck className="w-6 h-6" />
            </button>
            <button 
                onClick={() => setActivePopupImage(OFFERS_IMAGE_URL)}
                className="text-gray-400 hover:text-app-teal transition-colors" 
                title="Offers"
            >
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
                      : (session.activeWebhookUrl ? "Type your order..." : "Type a message")
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
