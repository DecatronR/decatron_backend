const mongoose = require("mongoose");

const PropertyListingSchema = new mongoose.Schema({
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
    required: true
  },
  propertySubType: {
    type: String,
    required: true
  },
  propertyCondition: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  neighbourhood: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  propertyDetails: {
    type: String,
    required: true
  },
  NoOfLivingRooms: {
    type: String,
    required: true
  },
  NoOfBedRooms: {
    type: String,
    required: true
  },
  NoOfKitchens: {
    type: String,
    required: true
  },
  NoOfParkingSpace: {
    type: String,
    required: true
  },
  Price: {
    type: String,
    required: true
  },
  virtualTour: {
    type: String,
    required: true
  },
  video: {
    type: String,
    required: true
  },
  isSoldOut: {
    type: String,
    required: false,
    default: '0'
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("PropertyListing", PropertyListingSchema);
