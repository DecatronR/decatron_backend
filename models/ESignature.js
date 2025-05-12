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
      required: function () {
        return !this.isWitnessSignature;
      },
    },
    email: {
      type: String,
      required: function () {
        return !this.isWitnessSignature;
      },
    },
  },
  witnessName: String, // for witness
  witnessEmail: String, //for witness
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
  signingToken: String, //for witness
  // New fields for witness relationships
  isWitnessSignature: {
    type: Boolean,
    default: false,
  },
  witnessedSignature: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ESignature",
  },
  witnessFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ESignature",
  },
});

// Add indexes for better query performance
ESignatureSchema.index({ contractId: 1, role: 1 });
ESignatureSchema.index({ witnessedSignature: 1 });
ESignatureSchema.index({ witnessFor: 1 });

module.exports = mongoose.model("ESignature", ESignatureSchema);
