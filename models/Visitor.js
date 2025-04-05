const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  browser: { type: String, required: true },
  os: { type: String, required: true },
  device: { type: String, required: true },
  visits: [
    {
      timestamp: { type: Date, default: Date.now },
      country: { type: String, required: true },
      region: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("Visitor", visitorSchema);
