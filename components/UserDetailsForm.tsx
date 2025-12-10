
import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { User, Phone, Mail, X, CheckCircle2 } from 'lucide-react';

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
  const [countryCode, setCountryCode] = useState<string>('...'); 
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetch('https://ipwho.is/')
        .then(response => response.json())
        .then(data => {
          if (data.success && data.calling_code) {
            setCountryCode(`+${data.calling_code}`);
          } else {
            setCountryCode('+971'); 
          }
        })
        .catch(err => {
          console.error("Failed to fetch location", err);
          setCountryCode('+971'); 
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.number.length !== 9) {
      setError('Phone number must be exactly 9 digits');
      return;
    }

    if (formData.name && formData.number && formData.email) {
      const fullUserData = {
        ...formData,
        number: `${countryCode}${formData.number}`
      };
      onSubmit(fullUserData);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData({...formData, number: value});
    if (error) setError('');
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#00a884] p-6 text-center relative">
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
             <User className="text-white w-6 h-6" />
          </div>
          <h3 className="text-white font-bold text-xl">Details Required</h3>
          <p className="text-white/80 text-sm mt-1">To connect you with the right agent</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider ml-1">Full Name</label>
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 focus-within:border-[#00a884] focus-within:ring-1 focus-within:ring-[#00a884] transition-all">
              <div className="pl-3 text-gray-400"><User className="w-5 h-5" /></div>
              <input 
                type="text" 
                required
                className="w-full bg-transparent p-3 text-gray-800 outline-none placeholder-gray-400"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider ml-1">Phone Number</label>
            <div className={`flex items-center bg-gray-50 rounded-lg border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus-within:border-[#00a884] focus-within:ring-1 focus-within:ring-[#00a884]'} transition-all overflow-hidden`}>
              <div className="pl-3 text-gray-400 flex-shrink-0"><Phone className="w-5 h-5" /></div>
              
              <div className="flex items-center justify-center bg-gray-100 px-3 py-3 ml-2 border-r border-gray-200 min-w-[3.5rem]">
                <span className="text-gray-600 font-mono font-medium">{countryCode}</span>
              </div>

              <input 
                type="tel" 
                required
                maxLength={9}
                className="w-full bg-transparent p-3 text-gray-800 outline-none placeholder-gray-400 font-mono"
                placeholder="123456789"
                value={formData.number}
                onChange={handleNumberChange}
              />
            </div>
            <div className="flex justify-between items-center px-1">
                <span className="text-[11px] text-red-500 h-4 flex items-center">{error}</span>
                <p className={`text-[11px] text-right transition-colors ${formData.number.length === 9 ? 'text-[#00a884] font-medium' : 'text-gray-400'}`}>
                {formData.number.length}/9
                </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider ml-1">Email Address</label>
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 focus-within:border-[#00a884] focus-within:ring-1 focus-within:ring-[#00a884] transition-all">
              <div className="pl-3 text-gray-400"><Mail className="w-5 h-5" /></div>
              <input 
                type="email" 
                required
                className="w-full bg-transparent p-3 text-gray-800 outline-none placeholder-gray-400"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white font-bold py-3.5 rounded-lg mt-2 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Start Messaging <CheckCircle2 className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
