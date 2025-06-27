const mongoose = require("mongoose");

const WhatsAppUserStateSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WhatsAppUserState", WhatsAppUserStateSchema);
