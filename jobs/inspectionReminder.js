const agenda = require("../services/agenda");
const sendPushNotification = require("../services/sendNotification");
const Notification = require("../models/Notification");

agenda.define("inspection reminder", async (job) => {
  const {
    agentFcm,
    clientFcm,
    propertyTitle,
    reminderType,
    agentId,
    userId,
    inspectionId,
  } = job.attrs.data;
  let body;
  let agentData = {};
  let clientData = {};
  let agentRoute = "";
  let clientRoute = "";
  let type = "inspection";
  switch (reminderType) {
    case "24h":
      body = `Your inspection for ${propertyTitle} is in 24 hours.`;
      agentRoute = `my-inspections/${agentId}`;
      clientRoute = `my-inspections/${userId}`;
      agentData = { route: agentRoute };
      clientData = { route: clientRoute };
      break;
    case "1h":
      body = `Your inspection for ${propertyTitle} is in 1 hour.`;
      agentRoute = `my-inspections/${agentId}`;
      clientRoute = `my-inspections/${userId}`;
      agentData = { route: agentRoute };
      clientData = { route: clientRoute };
      break;
    case "10m":
      body = `Your inspection for ${propertyTitle} is in 10 minutes.`;
      agentRoute = `my-inspections/${agentId}`;
      clientRoute = `my-inspections/${userId}`;
      agentData = { route: agentRoute };
      clientData = { route: clientRoute };
      break;
    case "now":
      body = `Your inspection for ${propertyTitle} starts now!`;
      agentRoute = `tracking/${inspectionId}`;
      clientRoute = `tracking/${inspectionId}`;
      agentData = { route: agentRoute };
      clientData = { route: clientRoute };
      break;
    default:
      body = `Your inspection for ${propertyTitle} is coming up.`;
      agentRoute = `my-inspections/${agentId}`;
      clientRoute = `my-inspections/${userId}`;
      agentData = { route: agentRoute };
      clientData = { route: clientRoute };
  }
  // Send push notifications
  await sendPushNotification(agentFcm, "Inspection Reminder", body, agentData);
  await sendPushNotification(
    clientFcm,
    "Inspection Reminder",
    body,
    clientData
  );
  // Save notifications to DB
  await Notification.create({
    userId: agentId,
    title: "Inspection Reminder",
    body,
    type,
    route: agentRoute,
    read: false,
    createdAt: new Date(),
  });
  await Notification.create({
    userId: userId,
    title: "Inspection Reminder",
    body,
    type,
    route: clientRoute,
    read: false,
    createdAt: new Date(),
  });
});
