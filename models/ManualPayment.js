const mongoose = require("mongoose");

const ManualPaymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false,
    ref: "User",
  },
  userName: {
    type: String,
    required: false,
  },
  userEmail: {
    type: String,
    required: false,
  },
  contractId: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

ManualPaymentSchema.index({ userId: 1, contractId: 1 }, { unique: true });

module.exports = mongoose.model("ManualPayment", ManualPaymentSchema);
