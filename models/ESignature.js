const mongoose = require("mongoose");

const WitnessSignatureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  ip: String,
  device: String,
});

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
    enum: ["propertyOwner", "tenant"],
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
  witness: WitnessSignatureSchema,
});

// Add compound indexes for uniqueness
ESignatureSchema.index(
  { contractId: 1, "user.id": 1, role: 1 },
  { unique: true, partialFilterExpression: { "user.id": { $exists: true } } }
);

// Add indexes for better query performance
ESignatureSchema.index({ contractId: 1, role: 1 });
ESignatureSchema.index({ "witness.email": 1 });

module.exports = mongoose.model("ESignature", ESignatureSchema);
