// WhatsApp Cloud API Configuration
module.exports = {
  // WhatsApp Cloud API credentials
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
  WHATSAPP_API_VERSION: "v18.0",

  // Webhook URL (your server endpoint)
  WEBHOOK_URL:
    process.env.WEBHOOK_URL || "https://your-domain.com/webhook/whatsapp",

  // Admin notification settings
  ADMIN_NOTIFICATION_DESTINATION: process.env.ADMIN_NOTIFICATION_DESTINATION,

  // API endpoints
  getApiUrl: function () {
    return `https://graph.facebook.com/${this.WHATSAPP_API_VERSION}/${this.WHATSAPP_PHONE_NUMBER_ID}`;
  },

  getMessagesUrl: function () {
    return `${this.getApiUrl()}/messages`;
  },

  getWebhookUrl: function () {
    return `${this.getApiUrl()}/subscriptions`;
  },
};
