const mongoose = require("mongoose");

const PropertyRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  category: { type: String, required: true },
  propertyType: { type: String, required: true },
  propertyUsage: { type: String, required: true },
  minBudget: { type: Number },
  maxBudget: { type: Number },
  role: { type: String }, // e.g., buyer, agent, etc.
  state: { type: String, required: true },
  lga: { type: String, required: true },
  neighbourhood: { type: String, required: true },
  note: { type: String },
  source: { type: String, default: "web" }, // e.g., 'web', 'whatsapp'
  status: { type: String, default: "open" }, //open, matched, closed
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PropertyRequest", PropertyRequestSchema);
