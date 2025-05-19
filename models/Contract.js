const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PropertyListing",
    required: true,
  },
  propertyName: {
    type: String,
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  ownerEmail: {
    type: String,
    required: true,
  },
  propertyPrice: {
    type: Number,
    required: true,
  },
  propertyLocation: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "completed", "cancelled"],
    default: "pending",
  },
  documentHash: {
    type: String,
    default: null,
  },
  documentContent: {
    type: Object,
    default: null,
  },
  auditTrail: {
    type: Object,
    default: null,
  },
  //agreement
  agreement: {
    rentAndDuration: {
      type: [String],
      default: [],
    },
    tenantObligations: {
      type: [String],
      default: [],
    },
    landlordObligations: {
      type: [String],
      default: [],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contract", ContractSchema);
