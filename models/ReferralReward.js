const mongoose = require("mongoose");

const ReferralRewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  referralCount: {
    type: Number,
    required: true,
  },
  daysAwarded: {
    type: Number,
    default: 30,
  },
  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "EXPIRED"],
    default: "PENDING",
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ReferralReward", ReferralRewardSchema);
