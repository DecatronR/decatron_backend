const sendPushNotification = require("../services/sendNotification");
const Notification = require("../models/Notification");

// Example controller method to trigger the notification
const sendNotificationController = async (req, res) => {
  const { fcmToken, title, body, data } = req.body;

  if (!fcmToken || !title || !body) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await sendPushNotification(fcmToken, title, body, data);
    return res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error in sending notification:", error);
    return res.status(500).json({ error: "Failed to send notification" });
  }
};

// GET /notifications?userId=...
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  sendNotificationController,
  getNotifications,
  markAsRead,
};
