
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

// Base URLs provided previously
const ELECTRICAL_EN = 'https://n8n.srv1040836.hstgr.cloud/webhook/webhook-english-electrical';
const ELECTRICAL_AR = 'https://n8n.srv1040836.hstgr.cloud/webhook/webhook-arabic-electrical';
const RESTAURANT_EN_BASE = 'https://n8n.srv1040836.hstgr.cloud/webhook/english-resturant';
const RESTAURANT_AR_BASE = 'https://n8n.srv1040836.hstgr.cloud/webhook/arabic-resturant';

// Derived specific webhooks for Restaurant Options
export const RESTAURANT_WEBHOOKS = {
  en: {
    driveThru: 'https://n8n.srv1040836.hstgr.cloud/webhook/dine-in-reservation',
    dineIn: 'https://n8n.srv1040836.hstgr.cloud/webhook/dine-in-reservation', // Using same webhook for Dine In as requested for Drive Thru (reservation)
  },
  ar: {
    driveThru: 'https://n8n.srv1040836.hstgr.cloud/webhook/arabic-resturant-drivethru',
    dineIn: 'https://n8n.srv1040836.hstgr.cloud/webhook/dine-in-reservation-arabic',
  }
};

export const CONTACTS: Contact[] = [
  {
    id: 'retailer-electrical',
    name: 'Retailer - Electrical',
    type: 'Retailer',
    iconName: 'Zap',
    webhooks: {
      en: ELECTRICAL_EN,
      ar: ELECTRICAL_AR
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
      en: RESTAURANT_EN_BASE,
      ar: RESTAURANT_AR_BASE
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
