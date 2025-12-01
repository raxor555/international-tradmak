
import React, { useState } from 'react';
import { UserData } from '../types';
import { User, Phone, Mail, X } from 'lucide-react';

interface UserDetailsFormProps {
  isOpen: boolean;
  onSubmit: (data: UserData) => void;
  onClose: () => void;
}

export const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ isOpen, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    number: '',
    email: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.number && formData.email) {
      onSubmit(formData);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-app-sidebar w-full max-w-md rounded-xl shadow-2xl border border-gray-700 overflow-hidden transform transition-all scale-100">
        <div className="bg-app-teal p-4 flex justify-between items-center">
          <h3 className="text-white font-semibold text-lg">Contact Information</h3>
          {/* Optional close button if user wants to peek, though flow implies requirement */}
          {/* <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button> */}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-400 mb-4">
            Please provide your details so we can better assist you.
          </p>

          <div className="space-y-2">
            <label className="text-xs text-app-teal font-medium uppercase tracking-wider">Full Name</label>
            <div className="flex items-center bg-app-input rounded-lg border border-gray-700 focus-within:border-app-teal transition-colors">
              <div className="pl-3 text-gray-400"><User className="w-5 h-5" /></div>
              <input 
                type="text" 
                required
                className="w-full bg-transparent p-3 text-app-text outline-none placeholder-gray-600"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-app-teal font-medium uppercase tracking-wider">Phone Number</label>
            <div className="flex items-center bg-app-input rounded-lg border border-gray-700 focus-within:border-app-teal transition-colors">
              <div className="pl-3 text-gray-400"><Phone className="w-5 h-5" /></div>
              <input 
                type="tel" 
                required
                className="w-full bg-transparent p-3 text-app-text outline-none placeholder-gray-600"
                placeholder="+1 234 567 890"
                value={formData.number}
                onChange={(e) => setFormData({...formData, number: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-app-teal font-medium uppercase tracking-wider">Email Address</label>
            <div className="flex items-center bg-app-input rounded-lg border border-gray-700 focus-within:border-app-teal transition-colors">
              <div className="pl-3 text-gray-400"><Mail className="w-5 h-5" /></div>
              <input 
                type="email" 
                required
                className="w-full bg-transparent p-3 text-app-text outline-none placeholder-gray-600"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-app-teal hover:bg-app-tealDark text-white font-bold py-3 rounded-lg mt-4 transition-colors shadow-lg"
          >
            Start Chatting
          </button>
        </form>
      </div>
    </div>
  );
};
