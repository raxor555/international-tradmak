
import React, { useState, useEffect, useRef } from 'react';
import { Contact, Message, Language, ChatSession, UserData, ChatOption } from '../types';
import { getIconComponent, RESTAURANT_WEBHOOKS } from '../constants';
import { MoreVertical, Search, Paperclip, Smile, Mic, Send, BookOpenCheck, BadgePercent, Car, ShoppingBag, Award, X, Utensils, Check, CheckCheck } from 'lucide-react';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isTyping]);

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
    const filteredMessages = session.messages.filter(msg => msg.type !== 'language-selector');
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
    
    if (!session.userData) {
      setShowUserForm(true);
    }
  };

  const handleFormSubmit = (userData: UserData) => {
    setShowUserForm(false);
    const updates: Partial<ChatSession> = { userData: userData };

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
    const langKey = session.language === Language.ENGLISH ? 'en' : 'ar';
    // @ts-ignore
    const specificWebhook = RESTAURANT_WEBHOOKS[langKey][option.value];

    if (!specificWebhook) {
      console.error("Webhook not found for option:", option.value);
      return;
    }

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

    onUpdateSession(contact.id, { 
        activeWebhookUrl: specificWebhook,
        selectedOption: option.value,
        messages: [...filteredMessages, userMsg]
    });

    setIsTyping(true);
    try {
      const responseText = await sendToWebhook(specificWebhook, {
        message: `User selected: ${option.value}`,
        selectedOption: option.value,
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
        alert("Please select a language first");
        return;
    }
    
    if (!session.userData) {
      setShowUserForm(true);
      return;
    }

    const text = inputText;
    setInputText('');
    
    onSendMessage(contact.id, text);

    let webhookUrl = session.activeWebhookUrl;
    if (!webhookUrl) {
       webhookUrl = session.language === Language.ENGLISH ? contact.webhooks.en : contact.webhooks.ar;
    }
    
    setIsTyping(true);
    
    try {
      const responseText = await sendToWebhook(webhookUrl, {
        message: text,
        selectedOption: session.selectedOption,
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

  // WhatsApp-like doodle background pattern, reduced opacity for light mode
  const bgPattern = `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23667781' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`;

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
    <div className="flex flex-col h-full bg-app-chat relative">
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
          <div className="relative max-w-full max-h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setActivePopupImage(null)} 
              className="absolute -top-12 right-0 p-2 bg-white rounded-full text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={activePopupImage} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              alt="Popup Content" 
            />
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{ backgroundImage: bgPattern }}
      ></div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-app-header border-b border-app-border z-10 h-[60px] shrink-0">
        <div className="flex items-center gap-4 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-app-teal flex items-center justify-center text-white overflow-hidden shadow-sm">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="font-normal text-app-text text-[16px] leading-tight">{contact.name}</h2>
            <p className="text-[13px] text-app-subtext leading-tight truncate max-w-[200px]">
                {session.language !== Language.UNSELECTED ? (
                   session.language === Language.ARABIC ? 'Arabic Support' : 'English Support'
                ) : 'click here for contact info'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-app-icon">
          <Search className="w-5 h-5 cursor-pointer hover:text-black" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-black" />
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 z-10 space-y-2">
        {session.messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Message Bubble */}
            <div 
              className={`relative max-w-[85%] md:max-w-[65%] rounded-lg shadow-msg text-[14.2px] leading-[19px] px-2 py-1.5 break-words
                ${msg.type === 'option-selector' 
                    ? 'w-full bg-transparent shadow-none p-0 max-w-full' 
                    : msg.sender === 'user' 
                        ? 'bg-app-outgoing text-app-text rounded-tr-none' 
                        : 'bg-app-incoming text-app-text rounded-tl-none'}
              `}
            >
              {msg.type === 'language-selector' && (
                <div className="flex flex-col gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100 max-w-sm mx-auto">
                  <p className="font-medium text-center pb-2 border-b border-gray-100 text-gray-700">{msg.text}</p>
                  <div className="flex gap-2 justify-center mt-1">
                    <button 
                        onClick={() => handleLanguageSelect(Language.ENGLISH)}
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-xs font-bold transition-colors uppercase tracking-wide border border-gray-200"
                    >
                        English
                    </button>
                    <button 
                        onClick={() => handleLanguageSelect(Language.ARABIC)}
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-xs font-bold transition-colors font-serif border border-gray-200"
                    >
                        العربية
                    </button>
                  </div>
                </div>
              )}

              {msg.type === 'option-selector' && msg.options && (
                <div className="flex flex-col items-center gap-3 w-full my-2">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-center shadow-sm border border-gray-100 text-gray-700 font-medium text-sm">
                        {msg.text}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mx-auto">
                        {msg.options.map((opt) => {
                            const OptIcon = getOptionIcon(opt.icon);
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleRestaurantOptionSelect(opt)}
                                    className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-app-teal/10 group-hover:bg-app-teal flex items-center justify-center text-app-teal group-hover:text-white transition-colors">
                                        <OptIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-gray-700 group-hover:text-black">{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
              )}
              
              {msg.type === 'image' && msg.mediaUrl && (
                 <div className="flex flex-col p-1">
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
                  <div className="px-1" dir={session.language === Language.ARABIC && msg.sender !== 'user' ? 'rtl' : 'ltr'}>
                    {msg.sender === 'bot' && msg.isAnimated ? (
                      <TypewriterText 
                        text={msg.text} 
                        onComplete={() => handleAnimationComplete(msg.id)}
                      />
                    ) : (
                      msg.text
                    )}
                  </div>
                  <div className="flex justify-end items-end gap-1 mt-1 select-none">
                    <span className="text-[11px] text-app-subtext min-w-fit">{formatTime(msg.timestamp)}</span>
                    {msg.sender === 'user' && (
                        <CheckCheck className="w-4 h-4 text-[#53bdeb]" /> // Blue tick simulation
                    )}
                  </div>
                </>
              )}
              
              {/* Timestamp for image types */}
              {msg.type === 'image' && (
                  <div className="flex justify-end items-end gap-1 px-1 pb-1">
                    <span className="text-[11px] text-app-subtext">{formatTime(msg.timestamp)}</span>
                     {msg.sender === 'user' && (
                        <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                    )}
                  </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 flex items-center gap-1 shadow-msg">
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
             </div>
           </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input Area */}
      <footer className="bg-app-header px-4 py-2 z-10 flex items-center gap-3 min-h-[62px]">
        <div className="flex gap-2 text-app-icon">
            <button className="hover:text-black transition-colors">
                <Smile className="w-6 h-6" />
            </button>
            <button className="hover:text-black transition-colors">
                <Paperclip className="w-6 h-6" />
            </button>
        </div>

        {isRestaurant && (
          <div className="flex gap-2 mr-1">
            <button 
                onClick={() => setActivePopupImage(MENU_IMAGE_URL)}
                className="text-app-icon hover:text-app-teal transition-colors" 
                title="Menu"
            >
                <BookOpenCheck className="w-6 h-6" />
            </button>
            <button 
                onClick={() => setActivePopupImage(OFFERS_IMAGE_URL)}
                className="text-app-icon hover:text-app-teal transition-colors" 
                title="Offers"
            >
                <BadgePercent className="w-6 h-6" />
            </button>
          </div>
        )}
        
        <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2 border border-white focus-within:border-white shadow-sm">
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
                      : (session.activeWebhookUrl ? "Type a message" : "Type a message")
                }
                disabled={session.language === Language.UNSELECTED || !session.userData || isTyping}
                className="w-full bg-transparent border-none outline-none text-app-text placeholder-gray-500 text-[15px]"
            />
        </div>

        {inputText.trim() ? (
            <button onClick={handleSend} className="text-app-icon hover:text-app-teal transition-colors">
                <Send className="w-6 h-6" />
            </button>
        ) : (
            <button className="text-app-icon hover:text-black transition-colors">
                <Mic className="w-6 h-6" />
            </button>
        )}
      </footer>
    </div>
  );
};
