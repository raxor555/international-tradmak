
import React from 'react';
import { Contact } from '../types';
import { getIconComponent } from '../constants';
import { User, MessageSquarePlus, MoreVertical, Search, Filter } from 'lucide-react';

interface ChatSidebarProps {
  contacts: Contact[];
  activeContactId: string | null;
  onSelectContact: (contact: Contact) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  contacts,
  activeContactId,
  onSelectContact
}) => {
  return (
    <div className="flex flex-col h-full w-full bg-app-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-app-header border-b border-app-border h-[60px] shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center cursor-pointer">
             <User className="text-white w-6 h-6" />
        </div>
        <div className="flex items-center gap-5 text-app-icon">
          <button title="New Chat" className="hover:text-black transition-colors"><MessageSquarePlus className="w-5 h-5" /></button>
          <button title="Menu" className="hover:text-black transition-colors"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 bg-app-sidebar border-b border-app-border">
        <div className="relative flex items-center bg-app-header rounded-lg h-9">
          <div className="w-12 flex items-center justify-center text-app-icon cursor-pointer pl-1">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="w-full bg-transparent text-sm text-app-text placeholder-gray-500 outline-none pr-4"
          />
          <div className="w-10 flex items-center justify-center text-app-icon cursor-pointer">
             <Filter className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => {
          const Icon = getIconComponent(contact.iconName);
          const isActive = contact.id === activeContactId;

          return (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`group flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors relative
                ${isActive ? 'bg-app-active' : 'hover:bg-[#f5f6f6]'}
              `}
            >
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-gray-100 ${isActive ? 'bg-app-teal text-white' : 'bg-gray-200 text-gray-500'}`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center border-b border-app-border pb-3 pt-1 group-last:border-none">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-normal text-[17px] truncate text-app-text">
                    {contact.name}
                  </h3>
                  <span className="text-xs text-app-subtext font-light">Yesterday</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-app-subtext truncate pr-2 font-light">
                    {contact.lastMessage || 'Click to start chatting...'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer / Branding */}
      <div className="p-3 text-center border-t border-app-border bg-app-header">
         <p className="text-[10px] text-app-subtext flex items-center justify-center gap-1 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-app-teal"></span>
            TradMAK Connect v2.0
         </p>
      </div>
    </div>
  );
};
