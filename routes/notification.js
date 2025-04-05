const express = require("express");
const {
  sendNotificationController,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/send-notification", sendNotificationController);

module.exports = router;
