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
  size: {
    type: String,
    required: false,
  },
  propertyDetails: {
    type: String,
    required: true,
  },
  livingrooms: {
    type: String,
    required: true,
  },
  bedrooms: {
    type: String,
    required: true,
  },
  bathrooms: {
    type: String,
    required: true,
  },
  parkingSpace: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  inspectionFee: {
    type: String,
    required: false,
  },
  titleDocument: {
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
