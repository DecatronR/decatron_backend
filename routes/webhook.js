const express = require("express");
const router = express.Router();
const { whatsappWebhook } = require("../controllers/webhookController");

// Twilio will POST incoming WhatsApp messages here
router.post("/whatsapp", whatsappWebhook);

module.exports = router;
