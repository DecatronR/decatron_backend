const mongoose = require("mongoose");

const ESignatureSchema = new mongoose.Schema({
  contractId: {
    type: String,
    required: true,
  },
  event: {
    type: String,
    enum: ["signed", "viewed", "declined"],
    required: true,
  },
  role: {
    type: String,
    enum: ["propertyOwner", "tenant", "propertyOwnerWitness", "tenantWitness"],
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  guestName: String, // for witness
  guestEmail: String, //for witness
  ip: {
    type: String,
  },
  device: {
    type: String,
  },
  signature: {
    type: String, // base64 image string
    required: true,
  },
  signingToken: String, //for guest
});

module.exports = mongoose.model("ESignature", ESignatureSchema);
