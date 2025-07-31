const WhatsAppUserState = require("../../models/WhatsAppUserState");

// Helper: Get/set user state in MongoDB
async function getUserStep(phone) {
  const record = await WhatsAppUserState.findOne({ phone });
  return record ? record.step : "menu";
}

// Updated setUserState to merge data and use 'step' for flow
async function setUserState(phone, step, data = {}, previousStep = null) {
  console.log("setUserState called with phone:", phone, "step:", step);
  const existing = (await WhatsAppUserState.findOne({ phone })) || {};
  const previous = existing._doc || {};
  const mergedData = { ...previous, ...data, step, updatedAt: new Date() };
  console.log("setUserState: saving merged data for phone:", phone, mergedData);
  await WhatsAppUserState.findOneAndUpdate({ phone }, mergedData, {
    upsert: true,
  });
  return previousStep;
}

async function getUserData(phone) {
  console.log("getUserData called with phone:", phone);
  const record = await WhatsAppUserState.findOne({ phone });
  console.log("getUserData: found record for phone:", phone, record);
  return record || {};
}

module.exports = {
  getUserStep,
  setUserState,
  getUserData,
};
