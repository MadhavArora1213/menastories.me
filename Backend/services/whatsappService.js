const axios = require('axios');

// WhatsApp Business API configuration
const WHATSAPP_CONFIG = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_ID,
  apiVersion: 'v18.0',
  baseUrl: 'https://graph.facebook.com'
};

// Send OTP via WhatsApp
const sendOtp = async (phoneNumber, otp) => {
  try {
    // Remove any non-numeric characters and ensure it starts with country code
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');

    // WhatsApp expects the phone number without the + sign
    // Extract local phone number when country code is present
    let whatsappPhoneNumber = cleanPhoneNumber;

    // Check if input contains country code and extract local number
    if (phoneNumber.startsWith('+')) {
      // Input has + sign, extract country code and local number
      if (cleanPhoneNumber.startsWith('91') && cleanPhoneNumber.length === 12) {
        // Indian number: +91XXXXXXXXXX → XXXXXXXXXX
        whatsappPhoneNumber = cleanPhoneNumber.substring(2); // Remove '91'
        console.log(`Indian number processed: ${cleanPhoneNumber} → ${whatsappPhoneNumber}`);
      } else if (cleanPhoneNumber.startsWith('1') && cleanPhoneNumber.length === 11) {
        // US number: +1XXXXXXXXXX → XXXXXXXXXX
        whatsappPhoneNumber = cleanPhoneNumber.substring(1); // Remove '1'
      } else if (cleanPhoneNumber.startsWith('44') && cleanPhoneNumber.length === 12) {
        // UK number: +44XXXXXXXXXX → XXXXXXXXXX
        whatsappPhoneNumber = cleanPhoneNumber.substring(2); // Remove '44'
      } else if (cleanPhoneNumber.length > 10) {
        // Other international numbers - try to detect country code length
        // For now, keep as is but log for debugging
        console.log('International number detected, keeping full format:', cleanPhoneNumber);
        whatsappPhoneNumber = cleanPhoneNumber;
      }
    } else {
      // No + sign in input, use existing logic
      if (cleanPhoneNumber.startsWith('91') && cleanPhoneNumber.length > 10) {
        // If it starts with 91 and is longer than 10 digits, remove 91
        whatsappPhoneNumber = cleanPhoneNumber.substring(2); // Remove '91'
        console.log(`Indian number without + processed: ${cleanPhoneNumber} → ${whatsappPhoneNumber}`);
      } else if (cleanPhoneNumber.startsWith('1') && cleanPhoneNumber.length === 11) {
        whatsappPhoneNumber = cleanPhoneNumber.substring(1); // Remove '1'
      } else if (cleanPhoneNumber.length === 10) {
        // Assume Indian number if 10 digits
        whatsappPhoneNumber = cleanPhoneNumber;
      } else {
        whatsappPhoneNumber = cleanPhoneNumber;
      }
    }

    const message = `Your verification code is: ${otp}. This code will expire in 10 minutes.`;

    console.log('Attempting to send WhatsApp OTP:', {
      originalPhone: phoneNumber,
      cleanedPhone: cleanPhoneNumber,
      extractedLocal: whatsappPhoneNumber,
      message: message,
      phoneNumberId: WHATSAPP_CONFIG.phoneNumberId,
      hasToken: !!WHATSAPP_CONFIG.accessToken,
      extraction: phoneNumber.startsWith('+') ? 'Country code detected and removed' : 'No country code in input'
    });

    // Check if WhatsApp credentials are configured
    if (!WHATSAPP_CONFIG.accessToken || !WHATSAPP_CONFIG.phoneNumberId) {
      console.warn('WhatsApp credentials not configured, using development mode');
      console.log(`[DEV MODE] WhatsApp OTP for ${phoneNumber}: ${otp}`);
      return { success: true, development: true, message: 'Development mode - OTP logged to console' };
    }

    const response = await axios.post(
      `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: whatsappPhoneNumber,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('WhatsApp OTP sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('WhatsApp API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // For development/testing purposes, fallback to console logging
    console.log(`[FALLBACK] WhatsApp OTP for ${phoneNumber}: ${otp}`);
    return { success: true, fallback: true, message: 'Fallback mode - OTP logged to console' };
  }
};

// Send custom message via WhatsApp
const sendMessage = async (phoneNumber, message) => {
  try {
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');

    const response = await axios.post(
      `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('WhatsApp send message error:', error.response?.data || error.message);
    throw new Error('Failed to send WhatsApp message');
  }
};

// Send newsletter via WhatsApp
const sendNewsletter = async (phoneNumber, subject, content) => {
  try {
    const message = `*${subject}*\n\n${content}`;

    return await sendMessage(phoneNumber, message);
  } catch (error) {
    console.error('WhatsApp newsletter error:', error);
    throw error;
  }
};

// Send promotional message
const sendPromotion = async (phoneNumber, title, description, ctaText, ctaUrl) => {
  try {
    let message = `*${title}*\n\n${description}`;

    if (ctaText && ctaUrl) {
      message += `\n\n${ctaText}: ${ctaUrl}`;
    }

    return await sendMessage(phoneNumber, message);
  } catch (error) {
    console.error('WhatsApp promotion error:', error);
    throw error;
  }
};

// Send bulk messages (be careful with rate limits)
const sendBulkMessages = async (recipients, message) => {
  const results = [];

  for (const recipient of recipients) {
    try {
      const result = await sendMessage(recipient.phoneNumber, message);
      results.push({
        phoneNumber: recipient.phoneNumber,
        success: true,
        messageId: result.messages?.[0]?.id
      });

      // Add delay to avoid rate limits (WhatsApp allows ~250 messages per hour)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    } catch (error) {
      results.push({
        phoneNumber: recipient.phoneNumber,
        success: false,
        error: error.message
      });
    }
  }

  return results;
};

// Verify WhatsApp webhook (for incoming messages)
const verifyWebhook = (mode, token, challenge) => {
  // Implement webhook verification for incoming WhatsApp messages
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return challenge;
  }

  return false;
};

// Handle incoming WhatsApp messages
const handleIncomingMessage = (webhookData) => {
  // Process incoming messages from users
  // This would be used for customer support, feedback, etc.

  try {
    const entries = webhookData.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field === 'messages') {
          const messages = change.value.messages || [];

          for (const message of messages) {
            // Process each incoming message
            console.log('Incoming WhatsApp message:', {
              from: message.from,
              message: message.text?.body,
              timestamp: message.timestamp
            });

            // You can implement auto-responses, customer support routing, etc.
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing incoming WhatsApp message:', error);
  }
};

module.exports = {
  sendOtp,
  sendMessage,
  sendNewsletter,
  sendPromotion,
  sendBulkMessages,
  verifyWebhook,
  handleIncomingMessage
};