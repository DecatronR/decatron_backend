const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  browser: { type: String, required: true }, // Extracted from userAgent
  os: { type: String, required: true }, // Extracted from userAgent
  device: { type: String, required: true }, // Mobile, Tablet, Desktop
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Visitor", visitorSchema);
