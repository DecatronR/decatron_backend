# WhatsApp Cloud API Setup Guide

This guide will help you migrate from Twilio to WhatsApp Cloud API for your property request functionality.

## Prerequisites

1. **Meta Developer Account**: Create an account at [developers.facebook.com](https://developers.facebook.com)
2. **WhatsApp Business Account**: Set up a WhatsApp Business account
3. **Verified Phone Number**: A phone number verified with WhatsApp Business
4. **Domain**: A publicly accessible domain for webhooks

## Step 1: Create WhatsApp App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "Create App" → "Business" → "WhatsApp"
3. Fill in your app details
4. Add WhatsApp product to your app

## Step 2: Configure WhatsApp Business API

1. In your app dashboard, go to "WhatsApp" → "Getting Started"
2. Add your phone number (must be verified with WhatsApp Business)
3. Note down your **Phone Number ID** (you'll need this for environment variables)

## Step 3: Generate Access Token

1. Go to "WhatsApp" → "API Setup"
2. Generate a **Permanent Access Token**
3. Save this token securely (you'll need it for environment variables)

## Step 4: Set Up Webhook

1. Go to "WhatsApp" → "Configuration" → "Webhooks"
2. Add your webhook URL: `https://your-domain.com/webhook/whatsapp`
3. Set the verify token (create a random string)
4. Subscribe to these events:
   - `messages`
   - `message_deliveries`
   - `message_reads`

## Step 5: Environment Variables

Add these to your `.env` file:

```env
# WhatsApp Cloud API (replace with your actual values)
WHATSAPP_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token_here
WEBHOOK_URL=https://your-domain.com/webhook/whatsapp

# Admin notifications (optional)
ADMIN_NOTIFICATION_DESTINATION=+2348012345678

# Remove or comment out Twilio variables
# TWILIO_ACCOUNT_SID=xxx
# TWILIO_AUTH_TOKEN=xxx
# TWILIO_WHATSAPP_NUMBER=xxx
```

## Step 6: Update Dependencies

Remove Twilio and ensure axios is installed:

```bash
npm uninstall twilio
npm install axios
```

## Step 7: Test Your Setup

1. Deploy your updated code
2. Send a message to your WhatsApp Business number
3. Check your server logs for webhook events
4. Verify that responses are sent back

## Step 8: Message Templates (Optional)

For non-session messages (like OTP), you'll need to create message templates:

1. Go to "WhatsApp" → "Message Templates"
2. Create templates for:
   - OTP messages
   - Welcome messages
   - Notification messages

## Key Differences from Twilio

| Feature             | Twilio                 | WhatsApp Cloud API             |
| ------------------- | ---------------------- | ------------------------------ |
| Phone Number Format | `whatsapp:+1234567890` | `+1234567890`                  |
| Webhook Format      | Simple POST            | Meta webhook format            |
| Message Types       | Basic text             | Rich media support             |
| Pricing             | Per message            | Free tier + usage              |
| Setup               | Simple                 | More complex but more features |

## Troubleshooting

### Common Issues:

1. **Webhook Verification Fails**

   - Check your verify token matches
   - Ensure your webhook URL is publicly accessible
   - Verify HTTPS is enabled

2. **Messages Not Sending**

   - Check your access token is valid
   - Verify phone number ID is correct
   - Ensure phone numbers are in international format

3. **Webhook Not Receiving Events**
   - Check webhook subscription is active
   - Verify webhook URL is correct
   - Check server logs for errors

### Testing Tools:

- **Meta Webhook Tester**: Use the built-in tester in your app dashboard
- **ngrok**: For local development: `ngrok http 3000`
- **Postman**: Test API endpoints manually

## Migration Checklist

- [ ] Create Meta Developer account
- [ ] Set up WhatsApp Business app
- [ ] Configure webhook
- [ ] Update environment variables
- [ ] Deploy updated code
- [ ] Test message flow
- [ ] Monitor logs for errors
- [ ] Update documentation
- [ ] Remove Twilio dependencies

## Support

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Meta Developer Community](https://developers.facebook.com/community/)
- [WhatsApp Business API Status](https://developers.facebook.com/status/)

## Cost Comparison

**Twilio WhatsApp Pricing:**

- $0.0049 per message (US)
- $0.0049 per message (International)

**WhatsApp Cloud API Pricing:**

- 1,000 free messages per month
- $0.005 per message after free tier
- No setup fees

**Savings:** Approximately 20-30% cost reduction for high volume usage.
