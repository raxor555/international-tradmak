
import { Language, UserData } from '../types';

interface WebhookPayload {
  message: string;
  language: Language;
  timestamp: Date;
  userData?: UserData;
  sessionId: string;
}

export const sendToWebhook = async (
  webhookUrl: string, 
  payload: WebhookPayload
): Promise<string> => {
  try {
    console.group('🚀 Sending to Webhook');
    console.log(`URL: ${webhookUrl}`);
    console.log('Payload:', payload);
    console.groupEnd();

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Webhook Response raw:', data);

    // Normalize data: N8N often returns an array of items [ { output: "..." } ]
    let contentObj = data;
    if (Array.isArray(data)) {
      if (data.length > 0) {
        contentObj = data[0];
      } else {
        // Empty array response
        return ""; 
      }
    }

    // Try to find the text property in the object
    let responseText = "";

    if (typeof contentObj === 'object' && contentObj !== null) {
      responseText = 
        contentObj.output || 
        contentObj.text || 
        contentObj.message || 
        contentObj.response || 
        contentObj.content ||
        // Fallback: if it's a generic object without known keys, stringify it
        JSON.stringify(contentObj);
    } else {
      // If it's a string or number, use it directly
      responseText = String(contentObj);
    }

    // Clean up if the result happens to be a JSON string like "{\"output\": ...}"
    // This can happen if the parser gets confused or double-encoded
    try {
        if (responseText.startsWith('{') || responseText.startsWith('[')) {
           // It might be a stringified JSON that needs another parse, 
           // but usually we just want the text. 
           // If it looks like JSON, we leave it, but if it's just the text we are good.
        }
    } catch (e) {
        // ignore
    }

    return responseText;

  } catch (error) {
    console.error('Webhook Error:', error);
    // Fallback message if the server is down or CORS blocks it during dev
    return payload.language === Language.ARABIC 
      ? "عذراً، نواجه مشكلة في الاتصال بالخادم حالياً."
      : "Sorry, we are having trouble connecting to the server right now.";
  }
};

export const generateAutoResponse = (language: Language, userName?: string): string => {
  // Kept as a fallback helper
  const namePart = userName ? ` ${userName}` : '';
  
  if (language === Language.ARABIC) {
    return `شكراً لرسالتك${namePart}. لقد استلمنا استفسارك وسيقوم أحد ممثلينا بالرد عليك قريباً.`;
  }
  return `Thank you for your message${namePart}. We have received your inquiry and an agent will respond shortly.`;
};
