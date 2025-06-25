const admin = require("./firebaseAdmin");

const sendPushNotification = async (fcmToken, title, body) => {
  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

module.exports = sendPushNotification;
