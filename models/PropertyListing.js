const mongoose = require("mongoose");

const PropertyListingSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  listingType: {
    type: String,
    required: true,
  },
  usageType: {
    type: String,
    required: true,
  },
  propertyType: {
    type: String,
    required: true,
  },
  propertySubType: {
    type: String,
    required: true,
  },
  propertyCondition: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  lga: {
    type: String,
    required: true,
  },
  neighbourhood: {
    type: String,
    required: true,
  },
  houseNoStreet: {
    type: String,
    required: false,
  },
  size: {
    type: String,
    required: false,
  },
  propertyDetails: {
    type: String,
    required: false,
  },
  livingrooms: {
    type: String,
    required: false,
  },
  bedrooms: {
    type: String,
    required: false,
  },
  bathrooms: {
    type: String,
    required: false,
  },
  parkingSpace: {
    type: String,
    required: false,
  },
  price: {
    type: String,
    required: true,
  },
  inspectionFee: {
    type: String,
    required: false,
  },
  cautionFee: {
    type: String,
    required: false,
  },
  agencyFee: {
    type: String,
    required: false,
  },
  latePaymentFee: {
    type: String,
    required: false,
  },
  virtualTour: {
    type: String,
    required: false,
  },
  video: {
    type: String,
    required: false,
  },
  isSoldOut: {
    type: String,
    required: false,
    default: "0",
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("PropertyListing", PropertyListingSchema);
