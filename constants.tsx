
import { Contact } from './types';
import { 
  Zap, 
  Droplet, 
  Hammer, 
  Paintbrush, 
  MonitorSmartphone, 
  Warehouse, 
  Utensils 
} from 'lucide-react';

export const MOCK_WEBHOOK_BASE = "https://api.tradmak-clone.com/webhook";

export const CONTACTS: Contact[] = [
  {
    id: 'retailer-electrical',
    name: 'Retailer - Electrical',
    type: 'Retailer',
    iconName: 'Zap',
    webhooks: {
      en: 'https://n8n.srv1040836.hstgr.cloud/webhook/webhook-english-electrical',
      ar: 'https://n8n.srv1040836.hstgr.cloud/webhook/webhook-arabic-electrical'
    },
    lastMessage: 'Circuit availability confirmed.'
  },
  {
    id: 'retailer-plumbing',
    name: 'Retailer - Plumbing',
    type: 'Retailer',
    iconName: 'Droplet',
    webhooks: {
      en: `${MOCK_WEBHOOK_BASE}/plumbing/en`,
      ar: `${MOCK_WEBHOOK_BASE}/plumbing/ar`
    },
    lastMessage: 'New pipes in stock.'
  },
  {
    id: 'retailer-hardware',
    name: 'Retailer - Hardware / Tools',
    type: 'Retailer',
    iconName: 'Hammer',
    webhooks: {
      en: `${MOCK_WEBHOOK_BASE}/hardware/en`,
      ar: `${MOCK_WEBHOOK_BASE}/hardware/ar`
    }
  },
  {
    id: 'retailer-paint',
    name: 'Retailer - Paint',
    type: 'Retailer',
    iconName: 'Paintbrush',
    webhooks: {
      en: `${MOCK_WEBHOOK_BASE}/paint/en`,
      ar: `${MOCK_WEBHOOK_BASE}/paint/ar`
    }
  },
  {
    id: 'retailer-appliances',
    name: 'Retailer - Home Appliances',
    type: 'Retailer',
    iconName: 'MonitorSmartphone',
    webhooks: {
      en: `${MOCK_WEBHOOK_BASE}/appliances/en`,
      ar: `${MOCK_WEBHOOK_BASE}/appliances/ar`
    }
  },
  {
    id: 'warehouses-gcc',
    name: 'Warehouses - GCC',
    type: 'Warehouse',
    iconName: 'Warehouse',
    webhooks: {
      en: `${MOCK_WEBHOOK_BASE}/warehouse/en`,
      ar: `${MOCK_WEBHOOK_BASE}/warehouse/ar`
    }
  },
  {
    id: 'restaurant-general',
    name: 'Restaurant',
    type: 'Service',
    iconName: 'Utensils',
    webhooks: {
      en: 'https://n8n.srv1040836.hstgr.cloud/webhook/english-resturant',
      ar: 'https://n8n.srv1040836.hstgr.cloud/webhook/arabic-resturant'
    }
  }
];

export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Zap': return Zap;
    case 'Droplet': return Droplet;
    case 'Hammer': return Hammer;
    case 'Paintbrush': return Paintbrush;
    case 'MonitorSmartphone': return MonitorSmartphone;
    case 'Warehouse': return Warehouse;
    case 'Utensils': return Utensils;
    default: return Zap;
  }
};
