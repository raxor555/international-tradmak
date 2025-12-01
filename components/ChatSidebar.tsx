import React from 'react';
import { Contact } from '../types';
import { getIconComponent } from '../constants';
import { User, MessageSquarePlus, MoreVertical, Search } from 'lucide-react';

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
    <div className="flex flex-col h-full w-full md:w-[400px] border-r border-gray-800 bg-app-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-app-sidebar border-b border-gray-700/50">
        <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center">
             <User className="text-gray-300 w-6 h-6" />
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <button className="hover:text-white transition-colors"><MessageSquarePlus className="w-5 h-5" /></button>
          <button className="hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 bg-app-sidebar">
        <div className="relative flex items-center bg-app-active rounded-lg h-9">
          <div className="w-16 flex items-center justify-center text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="w-full bg-transparent text-sm text-app-text placeholder-gray-400 outline-none pr-4"
          />
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
              className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors border-b border-gray-800 hover:bg-app-active ${isActive ? 'bg-app-active' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-app-teal text-white' : 'bg-gray-700 text-gray-300'}`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-medium truncate text-base ${isActive ? 'text-white' : 'text-app-text'}`}>
                    {contact.name}
                  </h3>
                  <span className="text-xs text-app-subtext">Yesterday</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-app-subtext truncate pr-2">
                    {contact.lastMessage || 'Click to start chatting...'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer / Branding */}
      <div className="p-3 text-center border-t border-gray-800">
         <p className="text-xs text-app-subtext flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-app-teal"></span>
            TradMAK Connect v1.0
         </p>
      </div>
    </div>
  );
};