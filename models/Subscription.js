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
  // Subscription type tracking
  isReferralReward: {
    type: Boolean,
    required: false,
    default: false,
  },
  isFreeTrial: {
    type: Boolean,
    required: false,
    default: false,
  },
  referralRewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReferralReward",
    required: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("Subscription", Subscription);
