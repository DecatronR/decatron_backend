const mongoose = require("mongoose");

const Subscription = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  SubscriptionPlanId: {
    type: String,
    required: true,
  },
  expiring: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("Subscription", Subscription);
