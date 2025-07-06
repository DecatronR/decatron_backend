const express = require("express");
const router = express.Router();
const { whatsappWebhook } = require("../controllers/webhookController");

// Meta will POST incoming WhatsApp messages here
router.post("/whatsapp", whatsappWebhook);

// Add GET handler for webhook verification
router.get("/whatsapp", whatsappWebhook);

module.exports = router;
