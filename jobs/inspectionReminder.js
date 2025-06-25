const agenda = require("../services/agenda");
const sendPushNotification = require("../services/sendNotification");

agenda.define("inspection reminder", async (job) => {
  const { agentFcm, clientFcm, propertyTitle, reminderType } = job.attrs.data;
  let body;
  switch (reminderType) {
    case "24h":
      body = `Your inspection for ${propertyTitle} is in 24 hours.`;
      break;
    case "1h":
      body = `Your inspection for ${propertyTitle} is in 1 hour.`;
      break;
    case "10m":
      body = `Your inspection for ${propertyTitle} is in 10 minutes.`;
      break;
    case "now":
      body = `Your inspection for ${propertyTitle} starts now!`;
      break;
    default:
      body = `Your inspection for ${propertyTitle} is coming up.`;
  }
  await sendPushNotification(agentFcm, "Inspection Reminder", body);
  await sendPushNotification(clientFcm, "Inspection Reminder", body);
});
