const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  browser: { type: String, required: true },
  os: { type: String, required: true },
  device: { type: String, required: true },
  visits: [{ timestamp: { type: Date, default: Date.now } }],
});

module.exports = mongoose.model("Visitor", visitorSchema);
