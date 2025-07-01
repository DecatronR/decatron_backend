const express = require("express");
const { body } = require("express-validator");
const {
  sendNotificationController,
  getNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");
const { unregisterFcmToken } = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/send-notification",
  [
    body("fcmToken").notEmpty().withMessage("FCM token is required"),
    body("title").notEmpty().withMessage("Title is required"),
    body("body").notEmpty().withMessage("Body is required"),
    body("data").optional().isObject().withMessage("Data must be an object"),
  ],
  sendNotificationController
);

// GET /notifications?userId=...
router.get("/", getNotifications);

// PATCH /notifications/:id/read
router.patch("/:id/read", markAsRead);

// routes/notification.js
router.post("/unregister-token", unregisterFcmToken);

// DELETE /notifications/:id
router.delete("/:id", requireAuth, deleteNotification);

// DELETE /notifications/clear/:userId
router.delete("/clear/:userId", requireAuth, clearAllNotifications);

module.exports = router;
