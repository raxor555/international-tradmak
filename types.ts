
export enum Language {
  ENGLISH = 'en',
  ARABIC = 'ar',
  UNSELECTED = 'unselected'
}

export interface WebhookConfig {
  en: string;
  ar: string;
}

export interface UserData {
  name: string;
  number: string;
  email: string;
}

export interface Contact {
  id: string;
  name: string;
  type: string; // e.g., 'Retailer', 'Warehouse'
  iconName: string; // Mapping to Lucide icon name
  webhooks: WebhookConfig;
  lastMessage?: string;
  timestamp?: string;
}

export interface ChatOption {
  label: string;
  value: string;
  icon?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system' | 'bot';
  timestamp: Date;
  type: 'text' | 'language-selector' | 'option-selector';
  isAnimated?: boolean; // New flag for typewriter effect
  options?: ChatOption[]; // For option-selector type
}

export interface ChatSession {
  contactId: string;
  messages: Message[];
  language: Language;
  userData?: UserData;
  sessionId: string; // Unique session ID for the conversation
  activeWebhookUrl?: string; // If set, overrides the default contact webhook
  selectedOption?: string; // Persist the selected option (e.g., 'driveThru')
}
