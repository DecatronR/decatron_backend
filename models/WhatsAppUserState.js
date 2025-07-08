const mongoose = require("mongoose");

const WhatsAppUserStateSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  step: { type: String, required: true }, // conversation step
  name: String,
  email: String,
  role: String,
  category: String,
  propertyType: String,
  bedrooms: Number,
  propertyUsage: String,
  minBudget: Number,
  maxBudget: Number,
  state: String, // property state (Abuja, Lagos, etc.)
  lga: String,
  neighbourhood: String,
  note: String,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WhatsAppUserState", WhatsAppUserStateSchema);
