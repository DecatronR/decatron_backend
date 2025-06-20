const express = require("express");
const { body } = require("express-validator");
const {
  sendNotificationController,
} = require("../controllers/notificationController");

const router = express.Router();

router.post(
  "/send-notification",
  [
    body("fcmToken").notEmpty().withMessage("FCM token is required"),
    body("title").notEmpty().withMessage("Title is required"),
    body("body").notEmpty().withMessage("Body is required"),
  ],
  sendNotificationController
);

module.exports = router;
