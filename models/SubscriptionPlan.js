const mongoose = require("mongoose");

const SubscriptionPlan = new mongoose.Schema({
  plan: {
    type: String,
    required: true,
    unique: true,
  },
  period: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("SubscriptionPlan", SubscriptionPlan);
