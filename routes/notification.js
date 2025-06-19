const express = require("express");
const {
  sendNotificationController,
} = require("../controllers/notificationController");

const router = express.Router();

router.post(
  "/send-notification",
  [body("requestAgentId").notEmpty().withMessage("Agent ID field is required")],
  sendNotificationController
);

router.post(
  "/agentRequest",
  requireAuth,
  [body("requestAgentId").notEmpty().withMessage("Agent ID field is required")],
  agentRequest
);

module.exports = router;
