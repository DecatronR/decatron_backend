const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    paymentReference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    paymentDescription: { type: String },
    currencyCode: { type: String, default: "NGN" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
