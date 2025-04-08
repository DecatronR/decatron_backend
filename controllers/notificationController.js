const sendPushNotification = require("../services/sendNotification");

// Example controller method to trigger the notification
const sendNotificationController = async (req, res) => {
  const { fcmToken, title, body } = req.body;

  if (!fcmToken || !title || !body) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await sendPushNotification(fcmToken, title, body);
    return res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error in sending notification:", error);
    return res.status(500).json({ error: "Failed to send notification" });
  }
};

module.exports = {
  sendNotificationController,
};
