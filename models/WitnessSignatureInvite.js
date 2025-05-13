const mongoose = require("mongoose");

const witnessSignatureInviteSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Contract",
  },
  witnessEmail: { type: String, required: true },
  witnessName: { type: String, required: true },
  role: { type: String, required: true },
  inviterName: { type: String, required: true },
  inviterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  signingToken: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "signed", "revoked", "expired"],
    default: "pending",
  },
  sentAt: { type: Date, default: Date.now },
  signedAt: { type: Date },
  tokenExpiresAt: { type: Date },
});

module.exports = mongoose.model(
  "WitnessSignatureInvite",
  witnessSignatureInviteSchema
);
